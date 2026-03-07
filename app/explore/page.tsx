"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, TrendingUp, Music2, ChevronUp, ChevronDown, Ticket, CheckCircle, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";
import { ARTISTS, GENRES } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { useVote } from "@/hooks/useVote";
import { useVoteCounts } from "@/hooks/useVoteCounts";
import { useVoteStore } from "@/lib/store/votes";
import Nav from "@/components/Nav";
import AppleMusicConnect from "@/components/AppleMusicConnect";
import ShareButton from "@/components/ShareButton";
import { createClient } from "@/lib/supabase/client";

const VOTE_TIERS = [
  { votes: 25000, key: "arena" as const },
  { votes: 7500, key: "concertHall" as const },
  { votes: 2500, key: "theatre" as const },
  { votes: 500, key: "bar" as const },
];

function getVenueLabel(votes: number, city: string): string {
  const venues = getVenuesForCity(city);
  for (const tier of VOTE_TIERS) {
    if (votes >= tier.votes) return venues[tier.key][0];
  }
  return "";
}

function getProgressToNext(votes: number): number {
  const sorted = [...VOTE_TIERS].sort((a, b) => a.votes - b.votes);
  const next = sorted.find((t) => t.votes > votes);
  if (!next) return 100;
  const prev = sorted[sorted.indexOf(next) - 1]?.votes ?? 0;
  return Math.min(((votes - prev) / (next.votes - prev)) * 100, 100);
}

function ArtistAvatar({ name, image }: { name: string; image: string | null }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (image) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
        <Image src={image} alt={name} fill className="object-cover" sizes="48px" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
      {initials}
    </div>
  );
}

export default function ExplorePage() {
  const [mounted, setMounted] = useState(false);
  const [artistSearch, setArtistSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [genreSearch, setGenreSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [liveArtists, setLiveArtists] = useState<typeof ARTISTS>([]);
  const { handleVote, hasVoted } = useVote();
  const { activeCity, setActiveCity } = useVoteStore();
  const [selectedCity, setSelectedCity] = useState(activeCity);
  const { counts, loading: countsLoading } = useVoteCounts(selectedCity);
  const [confirmedShows, setConfirmedShows] = useState<Record<string, boolean>>({});
  const [forYouArtists, setForYouArtists] = useState<typeof ARTISTS>([]);

  type DeezerArtist = { id: string; deezerId: number; name: string; image: string | null };
  const [deezerResults, setDeezerResults] = useState<DeezerArtist[]>([]);
  const [deezerLoading, setDeezerLoading] = useState(false);
  const [deezerVoting, setDeezerVoting] = useState<Record<string, boolean>>({});
  const [voteError, setVoteError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [recentlyVoted, setRecentlyVoted] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<{ artistId: string; city: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSent, setModalSent] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  // Auto-cast pending vote after magic-link sign-in
  useEffect(() => {
    const raw = localStorage.getItem("summon-pending-vote");
    if (!raw) return;
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        const { artistId, city } = JSON.parse(raw);
        localStorage.removeItem("summon-pending-vote");
        handleVote(artistId, city);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-select city from referral URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get("city");
    if (cityParam && CITIES.includes(cityParam)) {
      setSelectedCity(cityParam);
      setActiveCity(cityParam);
    }
  }, [setActiveCity]);

  useEffect(() => {
    fetch("/api/spotify-top-artists")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.artists)) setForYouArtists(data.artists); })
      .catch(() => {});
  }, []);

  // Fetch community-approved artists
  useEffect(() => {
    fetch("/api/live-artists")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.artists)) setLiveArtists(data.artists);
      })
      .catch(() => {});
  }, []);

  // Fetch pre-baked artist images from static public file
  useEffect(() => {
    fetch("/artist-images.json")
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === "object") setImages(data); })
      .catch(() => {});
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
        setCitySearch("");
      }
    }
    if (showCityDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCityDropdown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target as Node)) {
        setShowGenreDropdown(false);
        setGenreSearch("");
      }
    }
    if (showGenreDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGenreDropdown]);

  // Fetch confirmed shows from the cached /api/shows endpoint (1 request, not 15)
  useEffect(() => {
    fetch("/api/shows")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, boolean> = {};
        for (const show of data.shows ?? []) {
          if (show.artistId) map[show.artistId] = true;
        }
        setConfirmedShows(map);
      })
      .catch(() => {});
  }, []);

  const filteredCities = useMemo(
    () => CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );

  const filteredGenres = useMemo(
    () => GENRES.filter((g) => g.toLowerCase().includes(genreSearch.toLowerCase())),
    [genreSearch]
  );

  useEffect(() => { setVisibleCount(50); }, [artistSearch, selectedGenre, selectedCity]);

  const filteredArtists = useMemo(() => {
    const allArtists = [...ARTISTS, ...liveArtists.filter((la) => !ARTISTS.some((a) => a.id === la.id))];
    const withVotes = allArtists.map((a) => ({ ...a, votes: counts[a.id] ?? 0 }));
    const maxVotes = Math.max(...withVotes.map((a) => a.votes));
    const hotThreshold = maxVotes * 0.9;

    return withVotes
      .filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(artistSearch.toLowerCase());
        const matchGenre = selectedGenre === "All" || a.genre === selectedGenre;
        return matchSearch && matchGenre;
      })
      .map((a) => ({ ...a, trending: a.votes >= hotThreshold }))
      .sort((a, b) => b.votes - a.votes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistSearch, selectedGenre, selectedCity, counts, liveArtists]);

  // Deezer search — fires only when no static/live results match
  useEffect(() => {
    const q = artistSearch.trim();
    if (q.length < 2 || filteredArtists.length > 0) {
      setDeezerResults([]);
      return;
    }
    setDeezerLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search-artists?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data.artists)) setDeezerResults(data.artists); })
        .catch(() => {})
        .finally(() => setDeezerLoading(false));
    }, 400);
    return () => { clearTimeout(timer); setDeezerLoading(false); };
  }, [artistSearch, filteredArtists.length]);

  const handleDeezerVote = useCallback(async (artist: { id: string; deezerId: number; name: string; image: string | null }) => {
    if (!selectedCity) return;
    setDeezerVoting((v) => ({ ...v, [artist.id]: true }));
    try {
      const res = await fetch("/api/register-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deezerId: artist.deezerId, name: artist.name, image: artist.image }),
      });
      if (!res.ok) return;
      await handleVote(artist.id, selectedCity);
    } finally {
      setDeezerVoting((v) => ({ ...v, [artist.id]: false }));
    }
  }, [selectedCity, handleVote]);

  async function handleModalSubmit() {
    if (!modalEmail || !pendingVote) return;
    setModalLoading(true);
    setModalError("");
    localStorage.setItem("summon-pending-vote", JSON.stringify(pendingVote));
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: modalEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setModalLoading(false);
    if (error) {
      setModalError(error.message);
    } else {
      setModalSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Explore Artists</h1>
          <p className="mt-1 text-muted-foreground">
            {selectedCity
              ? <>Vote for who you want to see live in <span className="text-foreground font-medium">{selectedCity}</span></>
              : "Select your city to see local vote counts"}
          </p>
        </motion.div>

        {/* Filters row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.05}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
        >
          {/* City dropdown */}
          <div className="relative" ref={cityDropdownRef}>
            <div
              className={`glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors h-11 ${!selectedCity ? "border-primary/30 hover:border-primary/50 bg-primary/5" : "hover:border-primary/30"}`}
              onClick={() => { setShowCityDropdown((v) => !v); setShowGenreDropdown(false); }}
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className={`font-medium flex-1 text-sm truncate ${!selectedCity ? "text-primary" : ""}`}>{selectedCity || "Select city"}</span>
              {showCityDropdown ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>
            <AnimatePresence>
              {showCityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
                >
                  <div className="p-3 border-b border-border/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search cities..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="pl-9 bg-muted/50 border-0 h-9 rounded-lg"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setActiveCity(city); setShowCityDropdown(false); setCitySearch(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                          city === selectedCity ? "text-primary font-medium bg-primary/5" : "text-foreground"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                    {filteredCities.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">No cities found</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Artist search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artists..."
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              className="pl-9 bg-card border-border/60 rounded-xl h-11"
            />
          </div>

          {/* Genre dropdown */}
          <div className="relative" ref={genreDropdownRef}>
            <div
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors h-11"
              onClick={() => { setShowGenreDropdown((v) => !v); setShowCityDropdown(false); }}
            >
              <Music2 className="w-4 h-4 text-primary shrink-0" />
              <span className={`flex-1 text-sm truncate ${selectedGenre === "All" ? "text-muted-foreground" : "font-medium text-foreground"}`}>
                {selectedGenre === "All" ? "All genres" : selectedGenre}
              </span>
              {showGenreDropdown ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>
            <AnimatePresence>
              {showGenreDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
                >
                  <div className="p-3 border-b border-border/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search genres..."
                        value={genreSearch}
                        onChange={(e) => setGenreSearch(e.target.value)}
                        className="pl-9 bg-muted/50 border-0 h-9 rounded-lg"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => { setSelectedGenre(genre); setShowGenreDropdown(false); setGenreSearch(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                          genre === selectedGenre ? "text-primary font-medium bg-primary/5" : "text-foreground"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                    {filteredGenres.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">No genres found</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* No city selected prompt */}
        {!selectedCity && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.08}
            className="glass rounded-2xl p-5 mb-5 border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pick your city to get started</p>
                <p className="text-xs text-muted-foreground mt-0.5">Vote counts are local — select a city to see who&apos;s leading in your area.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["London", "New York", "Los Angeles", "Manchester", "Toronto"].map((city) => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setActiveCity(city); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium glass hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vote error toast */}
        {voteError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground text-sm px-4 py-2.5 rounded-xl shadow-lg">
            {voteError}
          </div>
        )}

        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="text-xs text-muted-foreground mb-4">
          {artistSearch.trim().length === 1
            ? "Keep typing to search…"
            : `${filteredArtists.length} artists${selectedCity ? ` · sorted by votes in ${selectedCity}` : " · select a city to see local rankings"}`}
          {selectedGenre !== "All" && <span> · <button onClick={() => setSelectedGenre("All")} className="text-primary hover:underline">{selectedGenre} ×</button></span>}
        </motion.p>

        {/* Connect music banner — shown when no For You artists loaded yet */}
        {forYouArtists.length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08} className="mb-5 glass rounded-xl p-4 flex items-center gap-4 border-primary/15">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Connect your music</p>
              <p className="text-xs text-muted-foreground mt-0.5">See artists from your library and get personalised picks.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AppleMusicConnect
                onArtists={(artists) =>
                  setForYouArtists((prev) => {
                    const newOnes = artists.filter((a) => !prev.some((p) => p.id === a.id));
                    return [...prev, ...newOnes];
                  })
                }
              />
              <Link href="/login" className="text-xs font-semibold text-[#1DB954] hover:underline whitespace-nowrap">
                Connect Spotify
              </Link>
            </div>
          </motion.div>
        )}

        {/* For You — Spotify + Apple Music matches */}
        {forYouArtists.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08} className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1DB954]">For You</p>
              <span className="text-xs text-muted-foreground">Based on your listening</span>
              <AppleMusicConnect
                onArtists={(artists) =>
                  setForYouArtists((prev) => {
                    const newOnes = artists.filter((a) => !prev.some((p) => p.id === a.id));
                    return [...prev, ...newOnes];
                  })
                }
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {forYouArtists.slice(0, 10).map((artist) => {
                const voted = mounted && hasVoted(artist.id, selectedCity);
                return (
                  <div key={artist.id} className="glass rounded-xl p-3 flex flex-col items-center gap-2 shrink-0 w-28 hover:border-[#1DB954]/30 transition-colors">
                    <ArtistAvatar name={artist.name} image={images[artist.name] ?? null} />
                    <p className="text-xs font-semibold text-center leading-tight line-clamp-2">{artist.name}</p>
                    <Button
                      size="sm"
                      onClick={() => handleVote(artist.id, selectedCity, () => { setPendingVote({ artistId: artist.id, city: selectedCity }); setShowAuthModal(true); })}
                      className={`w-full h-7 text-xs rounded-lg font-semibold px-2 ${
                        voted ? "gradient-brand text-white border-0" : "border border-primary/50 bg-primary/8 text-primary hover:bg-primary/15 hover:border-primary/70"
                      }`}
                    >
                      {voted ? "Voted" : "Vote"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Artist list */}
        <div className="flex flex-col gap-3">
          {filteredArtists.slice(0, visibleCount).map((artist, i) => {
            const voted = mounted && hasVoted(artist.id, selectedCity);
            const confirmed = confirmedShows[artist.id] ?? false;
            return (
              <div
                key={artist.id}
                className={`glass glass-hover rounded-xl overflow-hidden ${confirmed ? "border-green-500/30 hover:border-green-500/50" : "hover:border-primary/20"}`}
              >
                <div className="p-4 flex items-center gap-4">
                  <span className="text-muted-foreground text-sm font-mono w-6 text-center shrink-0 hidden sm:block">{i + 1}</span>

                  <ArtistAvatar name={artist.name} image={images[artist.name] ?? null} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/artist/${artist.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{artist.name}</Link>
                      {confirmed && (
                        <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs px-1.5 py-0.5">
                          <Ticket className="w-3 h-3 mr-1" />
                          Confirmed
                        </Badge>
                      )}
                      {!confirmed && artist.trending && (
                        <Badge className="bg-primary/15 text-primary border-primary/20 text-xs px-1.5 py-0.5">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Music2 className="w-3 h-3" />
                      {artist.subgenre ? `${artist.genre} · ${artist.subgenre}` : artist.genre}
                    </p>
                  </div>

                  {selectedCity && (
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">
                        {countsLoading ? <span className="text-muted-foreground">—</span> : artist.votes.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">votes</p>
                      <p className="text-xs text-muted-foreground/60 truncate max-w-[120px] hidden sm:block">
                        {!countsLoading && getVenueLabel(artist.votes, selectedCity)}
                      </p>
                    </div>
                  )}

                  {confirmed ? (
                    <Link href={`/artist/${artist.id}`} className="shrink-0">
                      <Button
                        size="sm"
                        className="rounded-lg h-9 px-3 font-semibold border-0 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <Ticket className="w-4 h-4 mr-1" />
                        Tickets
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      onClick={async () => {
                        const result = await handleVote(artist.id, selectedCity, () => {
                          setPendingVote({ artistId: artist.id, city: selectedCity });
                          setShowAuthModal(true);
                        });
                        if (result && !result.ok) {
                          setVoteError("Couldn't save your vote — please try again");
                          setTimeout(() => setVoteError(null), 3000);
                        } else if (result?.ok) {
                          setRecentlyVoted(artist.id);
                          setTimeout(() => setRecentlyVoted(null), 8000);
                        }
                      }}
                      className={`shrink-0 rounded-lg h-9 px-3 font-semibold btn-press transition-all ${
                        voted
                          ? "gradient-brand text-white glow-primary-sm border-0"
                          : "border border-primary/50 bg-primary/8 text-primary hover:bg-primary/15 hover:border-primary/70"
                      }`}
                    >
                      <ChevronUp className="w-4 h-4 mr-1" />
                      {voted ? "Voted" : "Vote"}
                    </Button>
                  )}
                </div>

                {/* Progress bar toward next threshold */}
                {selectedCity && !countsLoading && artist.votes > 0 && (
                  <div className="h-0.5 bg-muted/60 w-full">
                    <div
                      className={`h-full transition-all duration-700 ${confirmed ? "bg-green-500/60" : "gradient-brand opacity-60"}`}
                      style={{ width: `${getProgressToNext(artist.votes)}%` }}
                    />
                  </div>
                )}

                {/* Share strip after voting */}
                <AnimatePresence>
                  {recentlyVoted === artist.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-primary/8 border-t border-primary/15">
                        <p className="text-xs font-medium text-primary">
                          Voted! Share to push {artist.name} over the line →
                        </p>
                        <ShareButton
                          url={`${window.location.origin}/artist/${artist.id}?city=${encodeURIComponent(selectedCity)}`}
                          text={`I just voted for ${artist.name} in ${selectedCity} on Summon. Make this show happen! 🎶`}
                          label="Share"
                          size="sm"
                          className="shrink-0 h-7 px-3 rounded-lg gradient-brand border-0 text-white text-xs font-semibold"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {filteredArtists.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((v) => v + 50)}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground glass rounded-xl transition-colors mt-1"
          >
            Show more ({filteredArtists.length - visibleCount} remaining)
          </button>
        )}

        {!countsLoading && filteredArtists.length === 0 && deezerResults.length === 0 && !deezerLoading && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center py-16 text-muted-foreground">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No artists found. Try a different search or genre.</p>
          </motion.div>
        )}

        {/* Deezer "More artists" section */}
        {(deezerResults.length > 0 || deezerLoading) && filteredArtists.length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="mt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {deezerLoading ? "Searching…" : "More artists"}
            </p>
            <div className="flex flex-col gap-3">
              {deezerResults.map((artist) => {
                const voted = mounted && hasVoted(artist.id, selectedCity);
                const loading = deezerVoting[artist.id] ?? false;
                return (
                  <div key={artist.id} className="glass glass-hover rounded-xl overflow-hidden hover:border-primary/20">
                    <div className="p-4 flex items-center gap-4">
                      <ArtistAvatar name={artist.name} image={artist.image} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{artist.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Music2 className="w-3 h-3" />
                          Music
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={loading || !selectedCity}
                        onClick={() => handleDeezerVote(artist)}
                        className={`shrink-0 rounded-lg h-9 px-3 font-semibold btn-press transition-all ${
                          voted
                            ? "gradient-brand text-white glow-primary-sm border-0"
                            : "border border-primary/50 bg-primary/8 text-primary hover:bg-primary/15 hover:border-primary/70"
                        }`}
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        {loading ? "…" : voted ? "Voted" : "Vote"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Email capture modal for anonymous votes */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowAuthModal(false); setPendingVote(null); setModalSent(false); setModalEmail(""); setModalError(""); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative glass rounded-2xl p-6 w-full max-w-sm z-10"
            >
              <button
                onClick={() => { setShowAuthModal(false); setPendingVote(null); setModalSent(false); setModalEmail(""); setModalError(""); }}
                className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {modalSent ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <CheckCircle className="w-12 h-12 text-primary" />
                  <p className="font-bold text-lg">Check your email</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Click the magic link to sign in — your vote will be cast automatically.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-xl mb-1 text-center">Sign in to vote</h3>
                  <p className="text-sm text-muted-foreground text-center mb-5">
                    Enter your email and we&apos;ll send a magic link. Your vote will be cast automatically after you sign in.
                  </p>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleModalSubmit()}
                    className="h-12 rounded-xl bg-muted/50 border-border/60 text-center mb-3"
                  />
                  <Button
                    size="lg"
                    onClick={handleModalSubmit}
                    disabled={modalLoading || !modalEmail}
                    className="w-full h-12 rounded-xl gradient-brand border-0 text-white font-semibold"
                  >
                    {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send magic link"}
                  </Button>
                  {modalError && <p className="text-xs text-destructive mt-2 text-center">{modalError}</p>}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
