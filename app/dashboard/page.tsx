"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin, TrendingUp, Music2, ChevronUp, Zap,
  Trophy, Users, ChevronRight, ArrowRight, Flame
} from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import { getVenuesForCity } from "@/lib/data/venues";
import { useVoteStore } from "@/lib/store/votes";
import { useVote } from "@/hooks/useVote";
import { useVoteCounts } from "@/hooks/useVoteCounts";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";

// Venue thresholds by capacity
const VENUE_THRESHOLDS = [
  { label: "Bar / Club", tier: "bar" as const, capacity: "~200", votes: 500, color: "oklch(0.65 0.28 290)" },
  { label: "Theatre", tier: "theatre" as const, capacity: "~1,000", votes: 2500, color: "oklch(0.6 0.28 320)" },
  { label: "Concert Hall", tier: "concertHall" as const, capacity: "~3,000", votes: 7500, color: "oklch(0.65 0.24 25)" },
  { label: "Arena", tier: "arena" as const, capacity: "~15,000", votes: 25000, color: "oklch(0.75 0.22 60)" },
];

function getVenueThreshold(votes: number) {
  for (let i = VENUE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (votes >= VENUE_THRESHOLDS[i].votes) return VENUE_THRESHOLDS[i];
  }
  return null;
}

function getNextThreshold(votes: number) {
  return VENUE_THRESHOLDS.find((t) => t.votes > votes) ?? null;
}

function ArtistAvatar({ name, image }: { name: string; image: string | null }) {
  const parts = name.split(" ");
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.slice(0, 2);
  if (image) {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative">
        <Image src={image} alt={name} fill className="object-cover" sizes="40px" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
      {initials.toUpperCase()}
    </div>
  );
}

type ArtistWithVotes = (typeof ARTISTS)[0] & { votes: number; trending?: boolean };

function VoteProgress({ artist, cityVenues }: { artist: ArtistWithVotes; cityVenues: ReturnType<typeof getVenuesForCity> }) {
  const next = getNextThreshold(artist.votes);
  const current = getVenueThreshold(artist.votes);
  const prevVotes = current?.votes ?? 0;
  const nextVotes = next?.votes ?? prevVotes;
  const progress = next
    ? Math.min(((artist.votes - prevVotes) / (nextVotes - prevVotes)) * 100, 100)
    : 100;

  const currentName = current ? cityVenues[current.tier][0] : "Not yet";
  const nextName = next ? cityVenues[next.tier][0] : null;

  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{currentName}</span>
        <span>{nextName ? `${nextName} at ${next!.votes.toLocaleString()}` : "Max reached"}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-brand"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { votes, activeCity, setActiveCity, votedCities } = useVoteStore();
  const { handleVote, hasVoted } = useVote();
  const { counts, loading: countsLoading } = useVoteCounts(activeCity);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<Record<string, string | null>>({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/artist-images.json")
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === "object") setImages(data); })
      .catch(() => {});
  }, []);

  const cities = votedCities();
  const cityVotedIds = votes[activeCity] ?? [];
  const cityVenues = getVenuesForCity(activeCity);

  const cityArtists = ARTISTS
    .map((a) => ({ ...a, votes: counts[a.id] ?? 0 }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 8);

  const userVotedArtists = ARTISTS
    .filter((a) => cityVotedIds.includes(a.id))
    .map((a) => ({ ...a, votes: counts[a.id] ?? 0 }))
    .sort((a, b) => b.votes - a.votes);

  const closingInArtists = userVotedArtists.filter((artist) => {
    const next = getNextThreshold(artist.votes);
    if (!next) return false;
    const current = getVenueThreshold(artist.votes);
    const prevVotes = current?.votes ?? 0;
    const progress = (artist.votes - prevVotes) / (next.votes - prevVotes);
    return progress >= 0.75;
  });

  const totalVotes = cityVotedIds.length;
  const topArtist = cityArtists[0];
  const nextThreshold = getNextThreshold(topArtist.votes);
  const currentThreshold = getVenueThreshold(topArtist.votes);
  const prevVotes = currentThreshold?.votes ?? 0;
  const progressPct = nextThreshold
    ? Math.min(((topArtist.votes - prevVotes) / (nextThreshold.votes - prevVotes)) * 100, 100)
    : 100;

  // Wait for client hydration before branching on localStorage-backed state
  if (!mounted) return null;

  // Empty state for logged-out users
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Music2 className="w-12 h-12 mx-auto mb-4 text-primary opacity-60" />
            <h1 className="text-2xl font-bold mb-2">Sign in to see your dashboard</h1>
            <p className="text-muted-foreground mb-6">
              Track your votes and see how artists are doing in your city.
            </p>
            <Link href="/login">
              <Button className="gradient-brand border-0 text-white glow-primary-sm">
                Sign in <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty state when no votes in any city
  if (cities.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Music2 className="w-12 h-12 mx-auto mb-4 text-primary opacity-60" />
            <h1 className="text-2xl font-bold mb-2">No votes yet</h1>
            <p className="text-muted-foreground mb-6">
              Vote for artists you want to see live and your dashboard will come alive.
            </p>
            <Link href="/explore">
              <Button className="gradient-brand border-0 text-white glow-primary-sm">
                Explore Artists <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">

        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">Your activity</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            Your Dashboard
          </h1>
        </motion.div>

        {/* City switcher */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground font-medium">Your cities</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  city === activeCity
                    ? "gradient-brand text-white border-transparent glow-primary-sm"
                    : "glass text-muted-foreground hover:text-foreground border-border/40"
                }`}
              >
                {city}
              </button>
            ))}
            <Link href="/explore" className="shrink-0">
              <button className="px-4 py-2 rounded-full text-sm font-medium glass text-muted-foreground hover:text-foreground border border-dashed border-border/40 transition-all">
                + Add city
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.1}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: "Your Votes", value: totalVotes, icon: ChevronUp, color: "text-primary" },
            { label: "City Artists", value: cityArtists.length, icon: Users, color: "text-blue-400" },
            { label: "Trending", value: cityArtists.filter(a => a.trending).length, icon: TrendingUp, color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Top artist momentum card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.15}
          className="glass rounded-2xl p-5 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-brand opacity-5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Top momentum in {activeCity}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">{topArtist.name}</h2>
              <p className="text-primary font-semibold text-sm">
                {countsLoading ? "—" : topArtist.votes.toLocaleString()} votes
              </p>
            </div>
            <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              #{1} in city
            </Badge>
          </div>
          {nextThreshold && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress to {cityVenues[nextThreshold.tier][0]}</span>
                <span>{(topArtist.votes - prevVotes).toLocaleString()} / {(nextThreshold.votes - prevVotes).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-brand glow-primary-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {(nextThreshold.votes - topArtist.votes).toLocaleString()} more votes needed to trigger {cityVenues[nextThreshold.tier][0]} outreach
              </p>
            </>
          )}
        </motion.div>

        {/* Venue threshold guide */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Venue Thresholds in {activeCity}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VENUE_THRESHOLDS.map((t) => (
              <div key={t.label} className="glass rounded-xl p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">{t.label}</p>
                <p className="text-primary text-xs font-bold mb-1.5">{t.votes.toLocaleString()} votes</p>
                <ul className="space-y-0.5">
                  {cityVenues[t.tier].map((name) => (
                    <li key={name} className="text-xs text-foreground/80 leading-tight">{name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Your votes */}
        {userVotedArtists.length > 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.25} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Your Votes in {activeCity}
              </h2>
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2">
                  Add more <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {userVotedArtists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0.28 + i * 0.04}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ArtistAvatar name={artist.name} image={images[artist.name] ?? null} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/artist/${artist.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{artist.name}</Link>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Music2 className="w-3 h-3" />
                        {artist.genre}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-sm">
                        {countsLoading ? "—" : artist.votes.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">votes</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleVote(artist.id, activeCity)}
                      className="gradient-brand border-0 text-white rounded-lg h-8 px-3 text-xs font-semibold glow-primary-sm hover:opacity-80"
                      title="Click to unvote"
                    >
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Voted
                    </Button>
                  </div>
                  <VoteProgress artist={artist} cityVenues={cityVenues} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.25} className="mb-6">
            <div className="glass rounded-xl p-6 text-center">
              <Music2 className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground mb-3">No votes in {activeCity} yet.</p>
              <Link href="/explore">
                <Button size="sm" className="gradient-brand border-0 text-white">
                  Vote in {activeCity} <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Close to a milestone */}
        {closingInArtists.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.28} className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Close to a milestone
            </h2>
            <div className="flex flex-col gap-2">
              {closingInArtists.map((artist) => {
                const next = getNextThreshold(artist.votes);
                const current = getVenueThreshold(artist.votes);
                const prevVotes = current?.votes ?? 0;
                const votesNeeded = next ? next.votes - artist.votes : 0;
                const progress = next ? Math.min(((artist.votes - prevVotes) / (next.votes - prevVotes)) * 100, 100) : 100;
                const shareUrl = mounted ? `${window.location.origin}/artist/${artist.id}?city=${encodeURIComponent(activeCity)}` : `/artist/${artist.id}`;
                return (
                  <div key={artist.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3 border-orange-400/20">
                    <ArtistAvatar name={artist.name} image={images[artist.name] ?? null} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/artist/${artist.id}`} className="font-semibold text-sm hover:text-primary transition-colors truncate block">{artist.name}</Link>
                      <p className="text-xs text-orange-400 mt-0.5">{votesNeeded.toLocaleString()} votes to {next?.label}</p>
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                        <div className="h-full rounded-full bg-orange-400/70 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <ShareButton
                      url={shareUrl}
                      text={`Only ${votesNeeded.toLocaleString()} more votes to get ${artist.name} to ${next?.label} in ${activeCity}! Vote on Summon 🎶`}
                      label="Share"
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-8 px-3 rounded-lg glass text-muted-foreground hover:text-foreground text-xs border-0"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* City leaderboard */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.3}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {activeCity} Leaderboard
            </h2>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2">
                See all <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {cityArtists.map((artist, i) => {
              const voted = hasVoted(artist.id, activeCity);
              return (
                <motion.div
                  key={artist.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0.32 + i * 0.03}
                  className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
                    voted ? "border-primary/25" : ""
                  }`}
                >
                  <span className={`text-sm font-mono w-5 shrink-0 ${i < 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <ArtistAvatar name={artist.name} image={images[artist.name] ?? null} />
                  <div className="flex-1 min-w-0">
                    <Link href={`/artist/${artist.id}`} className="font-semibold text-sm truncate hover:text-primary transition-colors">{artist.name}</Link>
                    <p className="text-xs text-muted-foreground">{artist.genre}</p>
                  </div>
                  <p className="text-primary font-bold text-sm shrink-0">
                    {countsLoading ? "—" : artist.votes.toLocaleString()}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleVote(artist.id, activeCity)}
                    className={`shrink-0 rounded-lg h-8 px-3 text-xs font-semibold border-0 ${
                      voted
                        ? "gradient-brand text-white glow-primary-sm"
                        : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                    }`}
                  >
                    <ChevronUp className="w-3 h-3 mr-1" />
                    {voted ? "Voted" : "Vote"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
