"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, MapPin } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import { useVoteStore } from "@/lib/store/votes";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { CITIES } from "@/lib/data/cities";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type LeaderboardUser = {
  rank: number;
  userId: string;
  username: string | null;
  homeCity: string | null;
  voteCount: number;
  isSuperfan: boolean;
};

const RANK_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];


export default function LeaderboardPage() {
  const { activeCity } = useVoteStore();
  const [selectedCity, setSelectedCity] = useState("");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [homeCity, setHomeCity] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const cityDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityDropRef.current && !cityDropRef.current.contains(e.target as Node)) {
        setShowCityDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch user's home city and auth info from profile
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setAuthUser(data.user);
      supabase.from("profiles").select("city").eq("id", data.user.id).single()
        .then(({ data: p }) => { if (p?.city) setHomeCity(p.city); });
    });
  }, []);

  // Auto-select city: URL param > activeCity > home city
  useEffect(() => {
    if (!selectedCity) {
      if (activeCity) setSelectedCity(activeCity);
      else if (homeCity) setSelectedCity(homeCity);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCity, homeCity]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (authUser?.id) params.set("userId", authUser.id);
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setCurrentUser(data.currentUser ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCity, authUser?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">
            {selectedCity ? selectedCity : "Global"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Top Voters</h1>
          <p className="text-muted-foreground mt-1">
            {selectedCity
              ? `The fans making shows happen in ${selectedCity}`
              : "The fans making shows happen worldwide"}
          </p>
        </motion.div>

        {/* City filter */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCity("")}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                !selectedCity
                  ? "gradient-brand text-white border-transparent"
                  : "glass text-muted-foreground hover:text-foreground border-border/40"
              }`}
            >
              Global
            </button>

            <div className="relative flex-1" ref={cityDropRef}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                <Input
                  placeholder="Search cities…"
                  value={citySearch || selectedCity}
                  onChange={(e) => { setCitySearch(e.target.value); setShowCityDrop(true); if (!e.target.value) setSelectedCity(""); }}
                  onFocus={() => { setCitySearch(""); setShowCityDrop(true); }}
                  className="pl-9 bg-card border-border/60 rounded-xl h-10"
                />
              </div>
              <AnimatePresence>
                {showCityDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                        .map((city) => (
                          <button
                            key={city}
                            onClick={() => { setSelectedCity(city); setCitySearch(""); setShowCityDrop(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 flex items-center justify-between ${
                              city === selectedCity ? "text-primary font-medium bg-primary/5" : "text-foreground"
                            }`}
                          >
                            {city}
                            {city === homeCity && (
                              <span className="text-xs text-muted-foreground">your city</span>
                            )}
                          </button>
                        ))}
                      {CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">No cities found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-muted/60 rounded" />
                  <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted/60 rounded w-32" />
                    <div className="h-2 bg-muted/40 rounded w-20" />
                  </div>
                  <div className="h-4 bg-muted/60 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : users.filter((u) => u.username).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No named voters yet{selectedCity ? ` in ${selectedCity}` : ""}.</p>
            <p className="text-sm mt-1">Set a username on your profile to appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.filter((u) => u.username).map((user, i) => (
              <motion.div
                key={user.userId}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.1 + i * 0.03}
                className={`glass rounded-xl p-4 flex items-center gap-3 ${user.userId === authUser?.id ? "border-primary/30 bg-primary/5" : ""}`}
              >
                {/* Rank */}
                <span className={`text-sm font-mono w-6 text-center shrink-0 ${
                  i < 3 ? `${RANK_COLORS[i]} font-bold` : "text-muted-foreground"
                }`}>
                  {i < 3 ? (i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉") : user.rank}
                </span>

                {/* Avatar */}
                <UserAvatar
                  name={user.username ?? "Anonymous Fan"}
                  size={40}
                  rounded="rounded-xl"
                  textSize="text-sm"
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">
                      {user.username ?? "Anonymous fan"}
                    </p>
                    {user.isSuperfan && (
                      <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-xs shrink-0">
                        ⭐ Superfan
                      </Badge>
                    )}
                    {user.userId === authUser?.id && (
                      <Badge className="bg-primary/15 text-primary border-primary/20 text-xs shrink-0">You</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                    <span>{user.voteCount} vote{user.voteCount !== 1 ? "s" : ""}</span>
                    {user.homeCity && (
                      <>
                        <span>·</span>
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{user.homeCity}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`text-lg font-extrabold tabular-nums leading-none ${
                    i < 3 ? "gradient-brand-text" : "text-foreground"
                  }`}>
                    {user.voteCount}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Pinned "your rank" row — shown when user is outside top 50 */}
            {currentUser && (
              <>
                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-xs text-muted-foreground px-2">your rank</span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0.5}
                  className="glass rounded-xl p-4 flex items-center gap-3 border-primary/30 bg-primary/5"
                >
                  <span className="text-sm font-mono w-6 text-center shrink-0 text-muted-foreground">
                    {currentUser.rank}
                  </span>
                  <UserAvatar
                    name={currentUser.username ?? "You"}
                    size={40}
                    rounded="rounded-xl"
                    textSize="text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">
                        {currentUser.username ?? "You"}
                      </p>
                      <Badge className="bg-primary/15 text-primary border-primary/20 text-xs shrink-0">You</Badge>
                      {currentUser.isSuperfan && (
                        <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-xs shrink-0">
                          ⭐ Superfan
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span>{currentUser.voteCount} vote{currentUser.voteCount !== 1 ? "s" : ""}</span>
                      {currentUser.homeCity && (
                        <>
                          <span>·</span>
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{currentUser.homeCity}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-extrabold tabular-nums leading-none text-foreground">
                      {currentUser.voteCount}
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={0.5}
          className="text-xs text-muted-foreground text-center mt-8">
          Top voters{selectedCity ? ` in ${selectedCity}` : " globally"} · updates every minute · set a username to appear here
        </motion.p>
      </div>

      <Footer />
    </div>
  );
}
