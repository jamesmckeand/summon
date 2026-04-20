"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
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
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Fast-path: if cachedUser exists, skip the loading skeleton immediately after mount
  useEffect(() => {
    if (useVoteStore.getState().cachedUser) setLoading(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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
          displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Account",
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
          displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Account",
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

  // cachedUser gives instant render on navigation; live `user` verifies in background
  const displayName = cachedUser?.displayName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Account";
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
            <Button variant="ghost" size="sm" className={`text-sm ${pathname === "/explore" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Explore
            </Button>
          </Link>

          {loading && !cachedUser ? (
            <div className="w-16 h-8 rounded-lg bg-muted/30 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className={`text-sm ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <UserAvatar
                  name={displayName}
                  src={avatar}
                  size={32}
                  rounded="rounded-full"
                  textSize="text-xs"
                  className="ring-1 ring-white/10 hover:ring-primary/40 transition-all cursor-pointer"
                />
              </Link>
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
            <Link href="/dashboard">
              <UserAvatar
                name={displayName}
                src={avatar}
                size={32}
                rounded="rounded-full"
                textSize="text-xs"
              />
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
