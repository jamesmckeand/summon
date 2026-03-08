"use client";

import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";

type CityVote = { city: string; vote_count: number };

interface CityLeaderboardProps {
  cityVotes: CityVote[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  artistName: string;
}

export default function CityLeaderboard({ cityVotes, selectedCity, onSelectCity, artistName }: CityLeaderboardProps) {
  const maxVotes = cityVotes[0]?.vote_count ?? 1;

  if (cityVotes.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <MapPin className="w-8 h-8 mx-auto mb-3 text-primary opacity-40" />
        <p className="text-sm font-semibold mb-1">No votes yet anywhere</p>
        <p className="text-xs text-muted-foreground">Be the first fan to vote for {artistName} and start the movement.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">City Leaderboard</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {cityVotes.map((cv, i) => {
          const pct = Math.round((cv.vote_count / maxVotes) * 100);
          return (
            <div key={cv.city} className="flex items-center gap-3">
              <span className={`text-xs font-mono w-5 shrink-0 ${i < 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {i + 1}
              </span>
              <button
                onClick={() => onSelectCity(cv.city)}
                className={`text-sm font-medium w-28 shrink-0 truncate text-left hover:text-primary transition-colors ${cv.city === selectedCity ? "text-primary" : ""}`}
              >
                {cv.city}
              </button>
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
    </div>
  );
}
