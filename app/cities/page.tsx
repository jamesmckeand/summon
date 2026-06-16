"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";
import { cityToSlug } from "@/lib/utils/city-slug";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type CityStats = {
  city: string;
  totalVotes: number;
  topArtist: string | null;
  topArtistId: string;
};

const THRESHOLDS = [500, 2500, 7500, 25000];

function getNextThreshold(votes: number) {
  return THRESHOLDS.find((t) => t > votes) ?? null;
}

function progressPct(votes: number) {
  const next = getNextThreshold(votes);
  if (!next) return 100;
  const prev = THRESHOLDS[THRESHOLDS.indexOf(next) - 1] ?? 0;
  return Math.min(((votes - prev) / (next - prev)) * 100, 100);
}

export default function CitiesPage() {
  const [cities, setCities] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/city-stats")
      .then((r) => r.json())
      .then((data) => { setCities(data.cities ?? []); setError(null); })
      .catch(() => setError("Failed to load cities"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">Live rankings</p>
          <h1 className="text-3xl font-bold tracking-tight">City Leaderboard</h1>
          <p className="mt-1 text-muted-foreground">The most active cities on Summon, ranked by total votes.</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 h-20 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground text-sm py-12">{error}</p>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No votes yet — be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cities.map((c, i) => {
              const next = getNextThreshold(c.totalVotes);
              const pct = progressPct(c.totalVotes);
              return (
                <motion.div
                  key={c.city}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0.05 + Math.min(i, 15) * 0.03}
                >
                  <Link href={`/cities/${cityToSlug(c.city)}`}>
                    <div className={`glass rounded-xl p-4 hover:border-primary/20 transition-all group ${
                      i === 0 ? "border-yellow-500/25 bg-yellow-500/[0.03]" :
                      i === 1 ? "border-slate-400/20 bg-white/[0.02]" :
                      i === 2 ? "border-amber-600/20 bg-amber-500/[0.02]" : ""
                    }`}>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-mono w-7 text-center shrink-0 ${i < 3 ? "font-bold" : "text-muted-foreground"}`}
                          style={{ color: i === 0 ? "#facc15" : i === 1 ? "#cbd5e1" : i === 2 ? "#d97706" : undefined }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${i < 3 ? "gradient-brand" : "bg-muted/60"}`}>
                          <MapPin className={`w-4 h-4 ${i < 3 ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className={`font-semibold text-sm ${i < 3 ? "text-foreground" : ""}`}>{c.city}</p>
                            <div className="flex items-center gap-1 shrink-0">
                              <TrendingUp className="w-3 h-3 text-primary" />
                              <span className="text-sm font-bold text-primary">{c.totalVotes.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">votes</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full gradient-brand rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            {c.topArtist && (
                              <p className="text-xs text-muted-foreground truncate">
                                Top: <span className="text-foreground font-medium">{c.topArtist}</span>
                              </p>
                            )}
                            {next && (
                              <p className="text-xs text-muted-foreground shrink-0 ml-auto">
                                {(next - c.totalVotes).toLocaleString()} to next
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
