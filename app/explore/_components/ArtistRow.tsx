"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Music2, Ticket, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArtistAvatar from "@/components/ArtistAvatar";
import ShareButton from "@/components/ShareButton";

function getProgressToNext(votes: number): number {
  const TIERS = [500, 2500, 7500, 25000];
  const next = TIERS.find((t) => t > votes);
  if (!next) return 100;
  const prev = TIERS[TIERS.indexOf(next) - 1] ?? 0;
  return Math.min(((votes - prev) / (next - prev)) * 100, 100);
}

function getVenueLabel(votes: number, city: string): string {
  // Dynamic import avoided — just return tier label for now
  const TIERS = [
    { votes: 25000, label: "Arena" },
    { votes: 7500,  label: "Concert Hall" },
    { votes: 2500,  label: "Theatre" },
    { votes: 500,   label: "Bar / Club" },
  ];
  for (const t of TIERS) {
    if (votes >= t.votes) return t.label;
  }
  return "";
}

export interface ArtistRowProps {
  id: string;
  name: string;
  genre: string;
  subgenre?: string;
  votes: number;
  trending: boolean;
  rank: number;
  image: string | null;
  selectedCity: string;
  voted: boolean;
  confirmed: boolean;
  countsLoading: boolean;
  recentlyVoted: boolean;
  onVote: () => Promise<void>;
  onAuthRequired: () => void;
}

export default function ArtistRow({
  id, name, genre, subgenre, votes, trending, rank, image,
  selectedCity, voted, confirmed, countsLoading, recentlyVoted,
  onVote, onAuthRequired,
}: ArtistRowProps) {
  return (
    <div
      className={`glass glass-hover rounded-xl overflow-hidden ${
        confirmed ? "border-green-500/30 hover:border-green-500/50" : "hover:border-primary/20"
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        <span className="text-muted-foreground text-sm font-mono w-6 text-center shrink-0 hidden sm:block">
          {rank}
        </span>

        <ArtistAvatar name={name} image={image} size={48} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/artist/${id}`} className="font-semibold text-sm hover:text-primary transition-colors">
              {name}
            </Link>
            {confirmed && (
              <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs px-1.5 py-0.5">
                <Ticket className="w-3 h-3 mr-1" />
                Confirmed
              </Badge>
            )}
            {!confirmed && trending && (
              <Badge className="bg-primary/15 text-primary border-primary/20 text-xs px-1.5 py-0.5">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Music2 className="w-3 h-3" />
            {subgenre ? `${genre} · ${subgenre}` : genre}
          </p>
        </div>

        {selectedCity && (
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-primary">
              {countsLoading ? <span className="text-muted-foreground">—</span> : votes.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">votes</p>
            <p className="text-xs text-muted-foreground/60 truncate max-w-[120px] hidden sm:block">
              {!countsLoading && getVenueLabel(votes, selectedCity)}
            </p>
          </div>
        )}

        {confirmed ? (
          <Link href={`/artist/${id}`} className="shrink-0">
            <Button size="sm" className="rounded-lg h-9 px-3 font-semibold border-0 bg-green-500/20 text-green-400 hover:bg-green-500/30">
              <Ticket className="w-4 h-4 mr-1" />
              Tickets
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            disabled={!selectedCity}
            onClick={onVote}
            className={`shrink-0 rounded-lg h-9 px-3 font-semibold btn-press transition-all ${
              !selectedCity
                ? "border border-border/40 bg-muted/40 text-muted-foreground cursor-not-allowed"
                : voted
                ? "gradient-brand text-white glow-primary-sm border-0"
                : "border border-primary/50 bg-primary/8 text-primary hover:bg-primary/15 hover:border-primary/70"
            }`}
          >
            <ChevronUp className="w-4 h-4 mr-1" />
            {!selectedCity ? "Select city" : voted ? "Voted" : "Vote"}
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {selectedCity && !countsLoading && votes > 0 && (
        <div className="h-0.5 bg-muted/60 w-full">
          <div
            className={`h-full transition-all duration-700 ${confirmed ? "bg-green-500/60" : "gradient-brand opacity-60"}`}
            style={{ width: `${getProgressToNext(votes)}%` }}
          />
        </div>
      )}

      {/* Share strip */}
      <AnimatePresence>
        {recentlyVoted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-primary/8 border-t border-primary/15">
              <p className="text-xs font-medium text-primary">
                Voted! Share to push {name} over the line →
              </p>
              <ShareButton
                url={`${window.location.origin}/artist/${id}?city=${encodeURIComponent(selectedCity)}`}
                text={`I just voted for ${name} in ${selectedCity} on Summon. Make this show happen! 🎶`}
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
}
