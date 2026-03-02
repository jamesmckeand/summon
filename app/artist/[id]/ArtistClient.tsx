"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Music2, MapPin, ChevronUp, ChevronDown, Search,
  ExternalLink, Play, Users, Zap, Ticket, CalendarDays, PartyPopper,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { useVote } from "@/hooks/useVote";
import { useVoteStore } from "@/lib/store/votes";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import ShareButton from "@/components/ShareButton";

const VENUE_THRESHOLDS = [
  { label: "Bar / Club", tier: "bar" as const, votes: 500 },
  { label: "Theatre", tier: "theatre" as const, votes: 2500 },
  { label: "Concert Hall", tier: "concertHall" as const, votes: 7500 },
  { label: "Arena", tier: "arena" as const, votes: 25000 },
];

function getNextThreshold(votes: number) {
  return VENUE_THRESHOLDS.find((t) => t.votes > votes) ?? null;
}

function getVenueThreshold(votes: number) {
  for (let i = VENUE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (votes >= VENUE_THRESHOLDS[i].votes) return VENUE_THRESHOLDS[i];
  }
  return null;
}

type CityVote = { city: string; vote_count: number };
type Track = { title: string; preview: string; link: string };
type Show = { id: string; venue: string; city: string; date: string; ticketUrl: string };

export default function ArtistClient({ id }: { id: string }) {
  const artist = ARTISTS.find((a) => a.id === id);

  const [image, setImage] = useState<string | null>(null);
  const [cityVotes, setCityVotes] = useState<CityVote[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const { handleVote, hasVoted } = useVote();
  const { activeCity } = useVoteStore();

  useEffect(() => { setMounted(true); }, []);

  // Fetch confirmed shows whenever artist + city are known
  useEffect(() => {
    if (!artist || !selectedCity) return;
    setLoadingShows(true);
    fetch(`/api/artist-shows?artistName=${encodeURIComponent(artist.name)}&city=${encodeURIComponent(selectedCity)}`)
      .then((r) => r.json())
      .then((data) => setShows(data.shows ?? []))
      .catch(() => setShows([]))
      .finally(() => setLoadingShows(false));
  }, [artist?.name, selectedCity]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!artist) return;

    const loadVotes = () =>
      fetch(`/api/artist-votes?artistId=${encodeURIComponent(id)}`)
        .then((r) => r.json())
        .then((data) => { if (data.cityVotes) setCityVotes(data.cityVotes); })
        .catch(() => {});

    Promise.all([
      fetch(`/api/artist-image?name=${encodeURIComponent(artist.name)}`).then((r) => r.json()),
      fetch(`/api/artist-votes?artistId=${encodeURIComponent(id)}`).then((r) => r.json()),
      fetch(`/api/artist-tracks?name=${encodeURIComponent(artist.name)}`).then((r) => r.json()),
    ]).then(([imgData, votesData, tracksData]) => {
      if (imgData.image) setImage(imgData.image);
      const votes: CityVote[] = votesData.cityVotes ?? [];
      setCityVotes(votes);
      const topCity = votes[0]?.city ?? activeCity;
      setSelectedCity(topCity);
      setTracks(tracksData.tracks ?? []);
    }).catch(() => {}).finally(() => setLoadingData(false));

    // Realtime: re-fetch city votes whenever any vote for this artist changes
    const supabase = createClient();
    const channel = supabase
      .channel(`artist_votes:${id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "votes",
        filter: `artist_id=eq.${id}`,
      }, loadVotes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, artist?.name]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 text-center">
          <Music2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-2xl font-bold mb-2">Artist not found</h1>
          <p className="text-muted-foreground">This artist doesn&apos;t exist in our catalogue.</p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto space-y-5 animate-pulse">
          <div className="glass rounded-2xl h-48 sm:h-64 bg-muted/40" />
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="h-3 bg-muted/60 rounded w-20" />
            <div className="h-6 bg-muted/60 rounded w-40" />
            <div className="h-4 bg-muted/60 rounded w-24" />
            <div className="h-2 bg-muted/60 rounded-full w-full mt-2" />
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="h-3 bg-muted/60 rounded w-24" />
            <div className="h-10 bg-muted/60 rounded-xl w-full" />
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initials = artist.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const topCity = cityVotes[0];
  const selectedCityData = cityVotes.find((cv) => cv.city === selectedCity);
  const selectedVoteCount = selectedCityData?.vote_count ?? 0;
  const cityVenues = getVenuesForCity(selectedCity || activeCity);
  const nextThreshold = getNextThreshold(selectedVoteCount);
  const currentThreshold = getVenueThreshold(selectedVoteCount);

  const prevVotes = currentThreshold?.votes ?? 0;
  const progressPct = nextThreshold
    ? Math.min(((selectedVoteCount - prevVotes) / (nextThreshold.votes - prevVotes)) * 100, 100)
    : 100;

  const voted = mounted && hasVoted(artist.id, selectedCity || activeCity);
  const voteCity = selectedCity || activeCity;
  const confirmedShow = shows[0] ?? null;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/artist/${id}` : `/artist/${id}`;
  const votesNeeded = nextThreshold ? nextThreshold.votes - selectedVoteCount : 0;
  const shareText = confirmedShow
    ? `${artist.name} is coming to ${confirmedShow.venue} in ${voteCity}! Get your tickets 🎉`
    : voted && nextThreshold && votesNeeded > 0
      ? `I just voted for ${artist.name} in ${voteCity} on Summon. Only ${votesNeeded.toLocaleString()} more votes needed to trigger ${cityVenues[nextThreshold.tier][0]} outreach — add yours! 🎶`
      : `I just voted for ${artist.name} in ${voteCity} on Summon. Add your vote and let's make this show happen! 🎶`;

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(artist.name)}`;
  const instagramSearchUrl = `https://www.instagram.com/${artist.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}`;

  const filteredCities = CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));

  const maxVotes = cityVotes[0]?.vote_count ?? 1;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">

        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="glass rounded-2xl overflow-hidden mb-5">
          <div className="relative h-48 sm:h-64">
            {image ? (
              <Image src={image} alt={artist.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 672px" />
            ) : (
              <div className="absolute inset-0 gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-5xl">{initials}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className="bg-white/15 text-white border-white/20 text-xs">{artist.genre}</Badge>
                    {artist.subgenre && <Badge className="bg-white/10 text-white/80 border-white/15 text-xs">{artist.subgenre}</Badge>}
                    {artist.trending && (
                      <Badge className="bg-primary/80 text-white border-primary/30 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" /> Trending
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={spotifySearchUrl} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-green-500/60 flex items-center justify-center transition-colors"
                    title="Spotify"
                  >
                    <Music2 className="w-3.5 h-3.5 text-white" />
                  </a>
                  <a href={instagramSearchUrl} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-pink-500/60 flex items-center justify-center transition-colors"
                    title="Instagram"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>
                  <ShareButton
                    url={shareUrl}
                    text={`Vote for ${artist.name} on Summon and help make the show happen! 🎶`}
                    label="Share"
                    iconOnly
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white p-0 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top city + progress */}
        {topCity && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="glass rounded-2xl p-5 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 gradient-brand opacity-5 pointer-events-none" />
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top City</span>
            </div>
            <h2 className="text-xl font-bold mb-0.5">{topCity.city}</h2>
            <p className="text-primary font-semibold text-sm mb-3">{topCity.vote_count.toLocaleString()} votes</p>

            {(() => {
              const topVenues = getVenuesForCity(topCity.city);
              const topNext = getNextThreshold(topCity.vote_count);
              const topCurrent = getVenueThreshold(topCity.vote_count);
              const topPrev = topCurrent?.votes ?? 0;
              const topPct = topNext
                ? Math.min(((topCity.vote_count - topPrev) / (topNext.votes - topPrev)) * 100, 100)
                : 100;
              const currentName = topCurrent ? topVenues[topCurrent.tier][0] : "Not yet";
              const nextName = topNext ? topVenues[topNext.tier][0] : null;

              return (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{currentName}</span>
                    <span>{nextName ? `${nextName} at ${topNext!.votes.toLocaleString()}` : "Max reached"}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-brand"
                      initial={{ width: 0 }}
                      animate={{ width: `${topPct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Vote section */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {confirmedShow ? "Confirmed Show" : "Vote"}
            </p>
            {confirmedShow && (
              <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                <Ticket className="w-3 h-3 mr-1" /> On sale now
              </Badge>
            )}
          </div>

          {/* City selector */}
          <div className="relative mb-4">
            <div
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setShowCityDropdown((v) => !v)}
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium flex-1">{selectedCity || activeCity}</span>
              {showCityDropdown ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCities.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setSelectedCity(c); setShowCityDropdown(false); setCitySearch(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                          c === selectedCity ? "text-primary font-medium bg-primary/5" : "text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Confirmed show details */}
          {loadingShows ? (
            <div className="flex items-center justify-center gap-2 py-3 mb-4">
              <div className="w-4 h-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground">Checking for confirmed shows…</span>
            </div>
          ) : confirmedShow ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{confirmedShow.venue}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 shrink-0" />
                    {new Date(confirmedShow.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short", month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <a
                href={confirmedShow.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Get Tickets
              </a>
            </div>
          ) : (
            selectedCity && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{currentThreshold ? cityVenues[currentThreshold.tier][0] : "No votes yet"}</span>
                  <span>{nextThreshold ? `${cityVenues[nextThreshold.tier][0]} at ${nextThreshold.votes.toLocaleString()}` : "Max reached"}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-brand"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedVoteCount.toLocaleString()} votes in {selectedCity}</p>
              </div>
            )
          )}

          <Button
            onClick={() => !confirmedShow && handleVote(artist.id, selectedCity || activeCity)}
            disabled={!!confirmedShow}
            className={`w-full h-11 rounded-xl font-semibold border-0 transition-all ${
              confirmedShow
                ? "bg-green-500/20 text-green-400 cursor-default"
                : voted
                  ? "gradient-brand text-white glow-primary-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
            }`}
          >
            {confirmedShow ? (
              <><Ticket className="w-4 h-4 mr-2" /> Show confirmed in {voteCity}</>
            ) : (
              <><ChevronUp className="w-4 h-4 mr-2" />{voted ? "Voted" : `Vote in ${voteCity}`}</>
            )}
          </Button>

          {/* Share card */}
          <AnimatePresence>
            {(voted || confirmedShow) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className={`rounded-xl p-4 border ${confirmedShow ? "bg-green-500/10 border-green-500/20" : "bg-primary/10 border-primary/20"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${confirmedShow ? "bg-green-500/20" : "gradient-brand"}`}>
                      {confirmedShow
                        ? <PartyPopper className="w-4 h-4 text-green-400" />
                        : <Zap className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {confirmedShow
                          ? `${artist.name} has a confirmed show in ${voteCity}`
                          : nextThreshold && votesNeeded > 0
                            ? `${votesNeeded.toLocaleString()} more votes to ${cityVenues[nextThreshold.tier][0]}`
                            : "You're making this happen!"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {confirmedShow
                          ? "Spread the word — let your friends know!"
                          : `Invite friends to vote in ${voteCity} and push this over the line.`}
                      </p>
                    </div>
                  </div>
                  <ShareButton
                    url={shareUrl}
                    text={shareText}
                    label={confirmedShow ? "Share the news" : "Invite friends to vote"}
                    className={`w-full border-0 rounded-lg h-9 text-sm font-semibold ${confirmedShow ? "bg-green-500/20 hover:bg-green-500/30 text-green-400" : "gradient-brand text-white glow-primary-sm"}`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Top tracks */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.15} className="glass rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Top Tracks</p>
          {loadingData ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : tracks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {tracks.map((track, i) => (
                <a
                  key={i}
                  href={track.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{track.title}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-4">No track data available</p>
          )}
        </motion.div>

        {/* City leaderboard */}
        {cityVotes.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.2} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">City Leaderboard</p>
            </div>
            <div className="flex flex-col gap-2">
              {cityVotes.map((cv, i) => {
                const pct = Math.round((cv.vote_count / maxVotes) * 100);
                return (
                  <div key={cv.city} className="flex items-center gap-3">
                    <span className={`text-xs font-mono w-5 shrink-0 ${i < 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium w-28 shrink-0 truncate">{cv.city}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full gradient-brand"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + i * 0.04 }}
                      />
                    </div>
                    <span className="text-xs text-primary font-bold w-14 text-right shrink-0">
                      {cv.vote_count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {cityVotes.length === 0 && !loadingData && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.2} className="glass rounded-2xl p-8 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No votes yet. Be the first to vote!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
