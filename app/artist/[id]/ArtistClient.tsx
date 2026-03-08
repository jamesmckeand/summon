"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Music2, MapPin, ChevronUp,
  ExternalLink, Ticket, CalendarDays, PartyPopper, Zap, ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import { useVote } from "@/hooks/useVote";
import { useVoteStore } from "@/lib/store/votes";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import ShareButton from "@/components/ShareButton";
import CityDropdown from "@/components/CityDropdown";
import TracksSection from "./_components/TracksSection";
import CityLeaderboard from "./_components/CityLeaderboard";

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

type ArtistData = { id: string; name: string; genre: string; subgenre?: string; trending?: boolean };
type CityVote = { city: string; vote_count: number };
type Track = { title: string; preview: string | null; link: string; albumCover: string | null; duration: number | null };
type Show = { id: string; venue: string; city: string; date: string; ticketUrl: string };

export default function ArtistClient({ id }: { id: string }) {
  const staticArtist = ARTISTS.find((a) => a.id === id);
  const [artist, setArtist] = useState<ArtistData | null>(staticArtist ?? null);
  const [artistLoading, setArtistLoading] = useState(!staticArtist);

  const [image, setImage] = useState<string | null>(null);
  const [cityVotes, setCityVotes] = useState<CityVote[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const { handleVote, hasVoted } = useVote();
  const { activeCity } = useVoteStore();

  useEffect(() => { setMounted(true); }, []);

  // Fetch live artist if not in static list
  useEffect(() => {
    if (staticArtist) return;
    fetch("/api/live-artists")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.artists ?? []).find((a: ArtistData) => a.id === id);
        setArtist(found ?? null);
      })
      .catch(() => {})
      .finally(() => setArtistLoading(false));
  }, [id, staticArtist]);

  // Fetch confirmed shows when artist + city are known
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
      setSelectedCity(votes[0]?.city ?? activeCity ?? "");
      setTracks(tracksData.tracks ?? []);
    }).catch(() => {}).finally(() => setLoadingData(false));

    const supabase = createClient();
    const channel = supabase
      .channel(`artist_votes:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes", filter: `artist_id=eq.${id}` }, loadVotes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, artist?.name]);

  if (artistLoading) return <LoadingSkeleton />;
  if (!artist) return <NotFound />;
  if (loadingData) return <LoadingSkeleton detailed />;

  const initials = artist.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const topCity = cityVotes[0];
  const selectedCityData = cityVotes.find((cv) => cv.city === selectedCity);
  const selectedVoteCount = selectedCityData?.vote_count ?? 0;
  const nextThreshold = getNextThreshold(selectedVoteCount);
  const currentThreshold = getVenueThreshold(selectedVoteCount);
  const prevVotes = currentThreshold?.votes ?? 0;
  const progressPct = nextThreshold
    ? Math.min(((selectedVoteCount - prevVotes) / (nextThreshold.votes - prevVotes)) * 100, 100)
    : 100;

  const voted = mounted && hasVoted(artist.id, selectedCity || activeCity);
  const voteCity = selectedCity || activeCity;
  const confirmedShow = shows[0] ?? null;
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/artist/${id}${voteCity ? `?city=${encodeURIComponent(voteCity)}` : ""}`
    : `/artist/${id}`;
  const votesNeeded = nextThreshold ? nextThreshold.votes - selectedVoteCount : 0;
  const shareText = confirmedShow
    ? `${artist.name} is coming to ${confirmedShow.venue} in ${voteCity}! Get your tickets 🎉`
    : voted && nextThreshold && votesNeeded > 0
      ? `I just voted for ${artist.name} in ${voteCity} on Summon. Only ${votesNeeded.toLocaleString()} more votes needed — add yours! 🎶`
      : `I just voted for ${artist.name} in ${voteCity} on Summon. Make this show happen! 🎶`;

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(artist.name)}`;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-20 pb-20 px-6 max-w-2xl mx-auto">

        <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5 mt-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to explore
        </Link>

        {/* Hero card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="glass rounded-2xl overflow-hidden mb-5">
          {image && (
            <div className="relative w-full h-52 sm:h-64">
              <Image
                src={image.replace(/\/\d+x\d+-/, "/1000x1000-")}
                alt={artist.name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          )}
          <div className={`flex items-end gap-4 p-5 ${image ? "-mt-16 relative z-10" : ""}`}>
            {!image && (
              <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center ring-2 ring-border/60 shrink-0">
                <span className="text-white font-bold text-xl">{initials}</span>
              </div>
            )}
            {image && (
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white/20 shrink-0">
                <Image src={image} alt={artist.name} width={64} height={64} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl font-bold leading-tight truncate ${image ? "text-white" : ""}`}>{artist.name}</h1>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">{artist.genre}</Badge>
                {artist.subgenre && <Badge className="bg-muted/80 text-muted-foreground border-border/60 text-xs">{artist.subgenre}</Badge>}
                {artist.trending && (
                  <Badge className="bg-primary/80 text-white border-primary/30 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" /> Trending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 pb-5">
            <a href={spotifySearchUrl} target="_blank" rel="noopener noreferrer"
              className="h-7 px-2.5 rounded-lg glass text-xs font-medium flex items-center gap-1.5 hover:border-[#1DB954]/40 hover:text-[#1DB954] transition-colors"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              Spotify
            </a>
            <ShareButton
              url={shareUrl}
              text={`Vote for ${artist.name} on Summon and help make the show happen! 🎶`}
              label="Share"
              iconOnly
              variant="ghost"
              size="sm"
              className="h-7 w-7 rounded-lg glass text-muted-foreground hover:text-foreground p-0 border-0"
            />
          </div>
        </motion.div>

        {/* Top city momentum */}
        {topCity && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="glass rounded-2xl p-5 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 gradient-brand opacity-5 pointer-events-none" />
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Highest demand</span>
            </div>
            <h2 className="text-xl font-bold mb-0.5">{topCity.city}</h2>
            <p className="text-primary font-semibold text-sm mb-3">{topCity.vote_count.toLocaleString()} votes</p>
            {(() => {
              const topNext = getNextThreshold(topCity.vote_count);
              const topCurrent = getVenueThreshold(topCity.vote_count);
              const topPrev = topCurrent?.votes ?? 0;
              const topPct = topNext
                ? Math.min(((topCity.vote_count - topPrev) / (topNext.votes - topPrev)) * 100, 100)
                : 100;
              return (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{topCurrent?.label ?? "Building demand"}</span>
                    <span>{topNext ? `${topNext.votes.toLocaleString()} for ${topNext.label}` : "Max reached"}</span>
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
              {shows.length > 1 ? "Upcoming Shows" : confirmedShow ? "Confirmed Show" : "Vote"}
            </p>
            {confirmedShow && (
              <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                <Ticket className="w-3 h-3 mr-1" /> On sale now
              </Badge>
            )}
          </div>

          <CityDropdown value={selectedCity} onChange={setSelectedCity} className="mb-4" />

          {/* Confirmed show details */}
          {loadingShows ? (
            <div className="flex items-center justify-center gap-2 py-3 mb-4">
              <div className="w-4 h-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground">Checking for confirmed shows…</span>
            </div>
          ) : shows.length > 0 ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 mb-4 flex flex-col gap-3">
              {shows.map((show, idx) => (
                <div key={show.id}>
                  {idx > 0 && <div className="border-t border-green-500/20 -mx-4 mb-3" />}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <Ticket className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{show.venue}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 shrink-0" />
                        {new Date(show.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short", month: "long", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {show.ticketUrl && (
                    <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Get Tickets
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : selectedCity && (
            <div className="mb-4">
              {selectedVoteCount === 0 ? (
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 mb-3 text-center">
                  <p className="text-sm font-semibold text-primary">Be the first to vote in {selectedCity}!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Start the momentum — every show begins with one vote.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{currentThreshold?.label ?? "Building demand"}</span>
                    <span>{nextThreshold ? `${nextThreshold.votes.toLocaleString()} for ${nextThreshold.label}` : "Max reached"}</span>
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
                </>
              )}
            </div>
          )}

          <Button
            onClick={() => !confirmedShow && handleVote(artist.id, selectedCity || activeCity)}
            disabled={!!confirmedShow || !voteCity}
            className={`w-full h-11 rounded-xl font-semibold transition-all ${
              confirmedShow
                ? "bg-green-500/20 text-green-400 cursor-default border-0"
                : !voteCity
                  ? "bg-muted text-muted-foreground cursor-default border-0"
                  : voted
                    ? "gradient-brand text-white glow-primary-sm border-0"
                    : "border border-primary/50 bg-primary/8 text-primary hover:bg-primary/15 hover:border-primary/70"
            }`}
          >
            {confirmedShow ? (
              <><Ticket className="w-4 h-4 mr-2" /> Show confirmed in {voteCity}</>
            ) : !voteCity ? (
              <><MapPin className="w-4 h-4 mr-2" /> Select a city to vote</>
            ) : (
              <><ChevronUp className="w-4 h-4 mr-2" />{voted ? `Voted in ${voteCity}` : `Vote for ${voteCity}`}</>
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
                            ? `${votesNeeded.toLocaleString()} more votes for ${nextThreshold.label}`
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
        {tracks.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.15} className="glass rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top Tracks</p>
              <p className="text-xs text-muted-foreground">30s preview</p>
            </div>
            <TracksSection tracks={tracks} />
          </motion.div>
        )}

        {/* City leaderboard */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.2}>
          <CityLeaderboard
            cityVotes={cityVotes}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            artistName={artist.name}
          />
        </motion.div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto space-y-5 animate-pulse">
        <div className="h-64 bg-muted/40 rounded-2xl" />
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="h-3 bg-muted/60 rounded w-20" />
          <div className="h-6 bg-muted/60 rounded w-40" />
          <div className="h-2 bg-muted/60 rounded-full w-full mt-2" />
        </div>
        {detailed && (
          <>
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="h-3 bg-muted/60 rounded w-24" />
              <div className="h-10 bg-muted/60 rounded-xl w-full" />
            </div>
            <div className="glass rounded-2xl p-5 space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-12 bg-muted/40 rounded-xl" />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 text-center px-6">
        <Music2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-bold mb-2">Artist not found</h1>
        <p className="text-muted-foreground mb-6">This artist doesn&apos;t exist in our catalogue.</p>
        <Link href="/explore">
          <Button className="gradient-brand border-0 text-white">Browse artists</Button>
        </Link>
      </div>
    </div>
  );
}
