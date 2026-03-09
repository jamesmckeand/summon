"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useVoteStore } from "@/lib/store/votes";
import { CITIES } from "@/lib/data/cities";

async function hydrateVotes(initFromDb: (v: { artist_id: string; city: string }[]) => void) {
  try {
    const res = await fetch("/api/votes");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.votes)) initFromDb(data.votes);
  } catch { /* fire-and-forget */ }
}

async function detectCityFromIp(setActiveCity: (city: string) => void) {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return;
    const data = await res.json();
    const ipCity = data.city as string;
    if (!ipCity) return;
    const match = CITIES.find((c) => c.toLowerCase() === ipCity.toLowerCase());
    if (match) setActiveCity(match);
  } catch { /* fire-and-forget */ }
}

async function hydrateCity(setActiveCity: (city: string) => void, currentCity: string) {
  if (currentCity) return; // already set — don't override user's selection
  try {
    const res = await fetch("/api/profile");
    if (!res.ok) {
      await detectCityFromIp(setActiveCity);
      return;
    }
    const data = await res.json();
    if (data.profile?.city) {
      setActiveCity(data.profile.city);
    } else {
      await detectCityFromIp(setActiveCity);
    }
  } catch {
    await detectCityFromIp(setActiveCity);
  }
}

export default function Nav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  // Start loading=false if we have a cached user — prevents flicker on navigation
  const [loading, setLoading] = useState(() => typeof window === "undefined" || !useVoteStore.getState().cachedUser);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const router = useRouter();
  const pathname = usePathname();
  const { initFromDb, clearVotes, setActiveCity, activeCity, cachedUser, setCachedUser } = useVoteStore();


  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) {
        setCachedUser({
          id: u.id,
          displayName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "Account",
          avatarUrl: u.user_metadata?.avatar_url ?? null,
        });
        hydrateVotes(initFromDb);
        hydrateCity(setActiveCity, activeCity);
      } else {
        setCachedUser(null);
        if (!activeCity) detectCityFromIp(setActiveCity);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_IN" && u) {
        setCachedUser({
          id: u.id,
          displayName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "Account",
          avatarUrl: u.user_metadata?.avatar_url ?? null,
        });
        hydrateVotes(initFromDb);
        hydrateCity(setActiveCity, activeCity);
      }
      if (event === "SIGNED_OUT") {
        setCachedUser(null);
        clearVotes();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [initFromDb, clearVotes]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  // cachedUser gives instant render on navigation; live `user` verifies in background
  const displayName = cachedUser?.displayName ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Account";
  const avatar = cachedUser?.avatarUrl ?? user?.user_metadata?.avatar_url ?? null;
  const isLoggedIn = !!cachedUser || !!user;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/80 border-border/50 shadow-sm shadow-black/10"
          : "bg-transparent border-transparent"
      }`}>
        <Link href="/">
          <span className="text-lg font-bold tracking-tight gradient-brand-text">Summon</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
              Explore
            </Button>
          </Link>
          <Link href="/cities">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
              Cities
            </Button>
          </Link>
          <Link href="/shows">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
              Shows
            </Button>
          </Link>
          <Link href="/submit">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
              Suggest
            </Button>
          </Link>

          {loading && !cachedUser ? (
            <div className="w-16 h-8 rounded-lg bg-muted/30 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:border-primary/30 transition-colors cursor-pointer">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={displayName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {displayName}
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground px-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gradient-brand border-0 text-white font-medium text-sm px-4 rounded-lg glow-primary-sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile: logo + avatar/sign-in only — nav via bottom tab bar */}
        <div className="flex sm:hidden items-center gap-2">
          {loading && !cachedUser ? (
            <div className="w-8 h-8 rounded-full bg-muted/30 animate-pulse" />
          ) : isLoggedIn ? (
            <Link href="/profile">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gradient-brand border-0 text-white font-medium text-sm px-3 rounded-lg">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
