"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Music2, ChevronUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { useVote } from "@/hooks/useVote";
import { useVoteCounts } from "@/hooks/useVoteCounts";
import { useVoteStore } from "@/lib/store/votes";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import ArtistAvatar from "@/components/ArtistAvatar";
import AuthModal from "@/components/AuthModal";
import AppleMusicConnect from "@/components/AppleMusicConnect";
import ExploreFilters from "./_components/ExploreFilters";
import ArtistRow from "./_components/ArtistRow";

export default function ExplorePage() {
  const [mounted, setMounted] = useState(false);
  const [artistSearch, setArtistSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [liveArtists, setLiveArtists] = useState<typeof ARTISTS>([]);
  const [confirmedShows, setConfirmedShows] = useState<Record<string, boolean>>({});
  const [forYouArtists, setForYouArtists] = useState<typeof ARTISTS>([]);
  const [authedUser, setAuthedUser] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [recentlyVoted, setRecentlyVoted] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<{ artistId: string; city: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  type DeezerArtist = { id: string; deezerId: number; name: string; image: string | null };
  const [deezerResults, setDeezerResults] = useState<DeezerArtist[]>([]);
  const [deezerLoading, setDeezerLoading] = useState(false);
  const [deezerVoting, setDeezerVoting] = useState<Record<string, boolean>>({});

  const { handleVote, hasVoted } = useVote();
  const { activeCity, setActiveCity } = useVoteStore();
  const [selectedCity, setSelectedCity] = useState(activeCity);
  const { counts, loading: countsLoading } = useVoteCounts(selectedCity);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setAuthedUser(!!data.user)); }, []);

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

  // Pre-select city from URL param
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
    fetch("/api/live-artists")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.artists)) setLiveArtists(data.artists); })
      .catch(() => {});
    fetch("/artist-images.json")
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === "object") setImages(data); })
      .catch(() => {});
    fetch("/api/shows")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, boolean> = {};
        for (const show of data.shows ?? []) { if (show.artistId) map[show.artistId] = true; }
        setConfirmedShows(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { setVisibleCount(50); }, [artistSearch, selectedGenre, selectedCity]);

  const filteredArtists = useMemo(() => {
    const all = [...ARTISTS, ...liveArtists.filter((la) => !ARTISTS.some((a) => a.id === la.id))];
    const withVotes = all.map((a) => ({ ...a, votes: counts[a.id] ?? 0 }));
    const maxVotes = Math.max(...withVotes.map((a) => a.votes), 0);
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
    if (q.length < 2 || filteredArtists.length > 0) { setDeezerResults([]); return; }
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

  const handleDeezerVote = useCallback(async (artist: DeezerArtist) => {
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

  function handleCityChange(city: string) {
    setSelectedCity(city);
    setActiveCity(city);
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">
            {selectedCity ? selectedCity : `${CITIES.length} cities`}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Explore Artists</h1>
          <p className="mt-1 text-muted-foreground">
            {selectedCity
              ? <>Vote for who you want to see live in <span className="text-foreground font-medium">{selectedCity}</span></>
              : "Select your city to see local vote counts"}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="mb-5">
          <ExploreFilters
            selectedCity={selectedCity}
            selectedGenre={selectedGenre}
            artistSearch={artistSearch}
            onCityChange={handleCityChange}
            onGenreChange={setSelectedGenre}
            onArtistSearchChange={setArtistSearch}
          />
        </motion.div>

        {/* City Pulse strip */}
        {selectedCity && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08}
            className="card-solid rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-1">{selectedCity} pulse</p>
                <p className="text-2xl sm:text-3xl font-extrabold gradient-brand-text tabular-nums leading-none">
                  {Object.values(counts).reduce((s, v) => s + v, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">total votes</p>
              </div>
              {filteredArtists[0] && (
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-1">Leading</p>
                  <p className="font-bold text-sm">{filteredArtists[0].name}</p>
                  <p className="text-xs text-muted-foreground">{filteredArtists[0].votes.toLocaleString()} votes</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* No city prompt */}
        {!selectedCity && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08}
            className="glass rounded-2xl p-5 mb-5 border-primary/20 bg-primary/5">
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
                <button key={city} onClick={() => handleCityChange(city)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium glass hover:border-primary/40 hover:text-primary transition-colors">
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

        {/* Result count */}
        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="text-xs text-muted-foreground mb-4">
          {artistSearch.trim().length === 1
            ? "Keep typing to search…"
            : `${filteredArtists.length} artists${selectedCity ? ` · sorted by votes in ${selectedCity}` : " · select a city to see local rankings"}`}
          {selectedGenre !== "All" && (
            <span> · <button onClick={() => setSelectedGenre("All")} className="text-primary hover:underline">{selectedGenre} ×</button></span>
          )}
        </motion.p>

        {/* Connect music banner */}
        {forYouArtists.length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08}
            className="mb-5 card-solid rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Connect your music</p>
              <p className="text-xs text-muted-foreground mt-0.5">See artists from your library and get personalised picks.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AppleMusicConnect
                label="Apple Music"
                onArtists={(artists) =>
                  setForYouArtists((prev) => [...prev, ...artists.filter((a) => !prev.some((p) => p.id === a.id))])
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-xs font-semibold text-foreground transition-colors border border-border/40 whitespace-nowrap"
              />
              <button
                onClick={async () => {
                  if (authedUser) {
                    const supabase = createClient();
                    await supabase.auth.linkIdentity({ provider: "spotify", options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: "user-read-email user-read-private user-top-read" } });
                  } else {
                    window.location.href = "/login";
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-xs font-semibold text-[#1DB954] transition-colors border border-[#1DB954]/30 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Connect Spotify
              </button>
            </div>
          </motion.div>
        )}

        {/* For You */}
        {forYouArtists.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08} className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1DB954]">For You</p>
              <span className="text-xs text-muted-foreground">Based on your listening</span>
              <AppleMusicConnect
                onArtists={(artists) =>
                  setForYouArtists((prev) => [...prev, ...artists.filter((a) => !prev.some((p) => p.id === a.id))])
                }
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {forYouArtists.slice(0, 10).map((artist) => {
                const voted = mounted && hasVoted(artist.id, selectedCity);
                return (
                  <div key={artist.id} className="glass rounded-xl p-3 flex flex-col items-center gap-2 shrink-0 w-28 hover:border-[#1DB954]/30 transition-colors">
                    <ArtistAvatar name={artist.name} image={images[artist.name] ?? null} size={48} />
                    <p className="text-xs font-semibold text-center leading-tight line-clamp-2">{artist.name}</p>
                    <Button
                      size="sm"
                      disabled={!selectedCity}
                      onClick={() => handleVote(artist.id, selectedCity, () => { setPendingVote({ artistId: artist.id, city: selectedCity }); setShowAuthModal(true); })}
                      className={`w-full h-7 text-xs rounded-lg font-semibold px-2 ${
                        !selectedCity ? "border border-border/40 bg-muted/40 text-muted-foreground cursor-not-allowed"
                        : voted ? "gradient-brand text-white border-0"
                        : "border border-primary/50 bg-primary/8 text-primary hover:bg-primary/15 hover:border-primary/70"
                      }`}
                    >
                      {!selectedCity ? "Select city" : voted ? "Voted" : "Vote"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Artist list */}
        <div className="flex flex-col gap-3">
          {filteredArtists.slice(0, visibleCount).map((artist, i) => (
            <ArtistRow
              key={artist.id}
              id={artist.id}
              name={artist.name}
              genre={artist.genre}
              subgenre={artist.subgenre}
              votes={artist.votes}
              trending={artist.trending}
              rank={i + 1}
              image={images[artist.name] ?? null}
              selectedCity={selectedCity}
              voted={mounted && hasVoted(artist.id, selectedCity)}
              confirmed={confirmedShows[artist.id] ?? false}
              countsLoading={countsLoading}
              recentlyVoted={recentlyVoted === artist.id}
              onVote={async () => {
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
              onAuthRequired={() => { setPendingVote({ artistId: artist.id, city: selectedCity }); setShowAuthModal(true); }}
            />
          ))}
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

        {/* Deezer results */}
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
                      <ArtistAvatar name={artist.name} image={artist.image} size={48} />
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
                          voted ? "gradient-brand text-white glow-primary-sm border-0"
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

      <AuthModal
        open={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingVote(null); }}
        pendingVote={pendingVote}
      />
    </div>
  );
}
