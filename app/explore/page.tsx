"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, TrendingUp, Music2, ChevronUp, ChevronDown, Ticket } from "lucide-react";
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

  useEffect(() => { setMounted(true); }, []);

  // Fetch community-approved artists
  useEffect(() => {
    fetch("/api/live-artists")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.artists)) setLiveArtists(data.artists);
      })
      .catch(() => {});
  }, []);

  // Fetch artist images
  useEffect(() => {
    ARTISTS.forEach(async (artist) => {
      if (images[artist.name] !== undefined) return;
      try {
        const res = await fetch(`/api/artist-image?name=${encodeURIComponent(artist.name)}`);
        const data = await res.json();
        if (data.image) {
          setImages((prev) => ({ ...prev, [artist.name]: data.image }));
        }
      } catch {
        // fallback to initials
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Fetch confirmed shows for top 15 artists when city changes
  useEffect(() => {
    if (!selectedCity) return;
    setConfirmedShows({});
    const topArtists = [...ARTISTS]
      .map((a) => ({ ...a, votes: counts[a.id] ?? 0 }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 15);

    topArtists.forEach(async (artist) => {
      try {
        const res = await fetch(
          `/api/artist-shows?artistName=${encodeURIComponent(artist.name)}&city=${encodeURIComponent(selectedCity)}`
        );
        const data = await res.json();
        if ((data.shows ?? []).length > 0) {
          setConfirmedShows((prev) => ({ ...prev, [artist.id]: true }));
        }
      } catch { /* ignore */ }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const filteredCities = useMemo(
    () => CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );

  const filteredGenres = useMemo(
    () => GENRES.filter((g) => g.toLowerCase().includes(genreSearch.toLowerCase())),
    [genreSearch]
  );

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
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors h-11"
              onClick={() => { setShowCityDropdown((v) => !v); setShowGenreDropdown(false); }}
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium flex-1 text-sm truncate">{selectedCity}</span>
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

        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="text-xs text-muted-foreground mb-4">
          {filteredArtists.length} artists · sorted by votes in {selectedCity}
          {selectedGenre !== "All" && <span> · <button onClick={() => setSelectedGenre("All")} className="text-primary hover:underline">{selectedGenre} ×</button></span>}
        </motion.p>

        {/* Artist list */}
        <div className="flex flex-col gap-3">
          {filteredArtists.map((artist, i) => {
            const voted = mounted && hasVoted(artist.id, selectedCity);
            const confirmed = confirmedShows[artist.id] ?? false;
            return (
              <motion.div
                key={artist.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.12 + Math.min(i, 10) * 0.03}
                className={`glass rounded-xl p-4 flex items-center gap-4 transition-all ${confirmed ? "border-green-500/30 hover:border-green-500/50" : "hover:border-primary/20"}`}
              >
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

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-sm font-bold text-primary">
                    {countsLoading ? <span className="text-muted-foreground">—</span> : artist.votes.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">votes</p>
                  <p className="text-xs text-muted-foreground/60 truncate max-w-[120px]">
                    {!countsLoading && getVenueLabel(artist.votes, selectedCity)}
                  </p>
                </div>

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
                    onClick={() => handleVote(artist.id, selectedCity)}
                    className={`shrink-0 rounded-lg h-9 px-3 font-semibold border-0 transition-all ${
                      voted ? "gradient-brand text-white glow-primary-sm" : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    {voted ? "Voted" : "Vote"}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredArtists.length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center py-16 text-muted-foreground">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No artists found. Try a different search or genre.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
