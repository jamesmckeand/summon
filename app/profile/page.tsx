"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, MapPin, Search, ChevronDown, ChevronUp, Check, X,
  Music2, Pencil, Save, Headphones,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { useVoteStore } from "@/lib/store/votes";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const VENUE_TIERS = ["bar", "theatre", "concertHall", "arena"] as const;
const TIER_LABELS: Record<string, string> = {
  bar: "Bar / Club (~200)",
  theatre: "Theatre (~1,000)",
  concertHall: "Concert Hall (~3,000)",
  arena: "Arena (~15,000)",
};

type Profile = {
  username: string | null;
  city: string | null;
  favourite_venues: string[];
  favourite_artists: string[];
};

function GradientAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-2xl">
      {initials || <User className="w-8 h-8" />}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { votes } = useVoteStore();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile>({
    username: null,
    city: null,
    favourite_venues: [],
    favourite_artists: [],
  });
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [artistSearch, setArtistSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);
    });

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            username: data.profile.username ?? null,
            city: data.profile.city ?? null,
            favourite_venues: data.profile.favourite_venues ?? [],
            favourite_artists: data.profile.favourite_artists ?? [],
          });
          setUsernameInput(data.profile.username ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filteredCities = useMemo(
    () => CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );

  const filteredArtists = useMemo(() => {
    if (!artistSearch.trim()) return [];
    return ARTISTS.filter(
      (a) =>
        a.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
        !profile.favourite_artists.includes(a.id)
    ).slice(0, 8);
  }, [artistSearch, profile.favourite_artists]);

  const cityVenues = profile.city ? getVenuesForCity(profile.city) : null;

  async function patch(updates: Partial<Profile>) {
    const key = Object.keys(updates)[0];
    setSaving(key);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
    setProfile((prev) => ({ ...prev, ...updates }));
    setSaving(null);
  }

  async function saveUsername() {
    await patch({ username: usernameInput.trim() || null });
    setEditingUsername(false);
  }

  async function selectCity(city: string) {
    setShowCityDropdown(false);
    setCitySearch("");
    await patch({ city, favourite_venues: [] });
  }

  function toggleVenue(tier: string) {
    const newVenues = profile.favourite_venues.includes(tier)
      ? profile.favourite_venues.filter((v) => v !== tier)
      : [...profile.favourite_venues, tier];
    patch({ favourite_venues: newVenues });
  }

  function addArtist(id: string) {
    if (profile.favourite_artists.includes(id)) return;
    const newArtists = [...profile.favourite_artists, id];
    patch({ favourite_artists: newArtists });
    setArtistSearch("");
  }

  function removeArtist(id: string) {
    const newArtists = profile.favourite_artists.filter((a) => a !== id);
    patch({ favourite_artists: newArtists });
  }

  const displayName =
    profile.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const totalVotes = Object.values(votes).reduce((sum, ids) => sum + ids.length, 0);
  const citiesVotedIn = Object.entries(votes).filter(([, ids]) => ids.length > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-5 mb-8">
          {user?.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <GradientAvatar name={displayName} />
          )}
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            {user?.app_metadata?.provider === "spotify" && (
              <Badge className="mt-1.5 bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                <Headphones className="w-3 h-3 mr-1" /> Spotify
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalVotes}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Votes Cast</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{citiesVotedIn}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cities Voted In</p>
          </div>
        </motion.div>

        {/* Username */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Username</p>
            {!editingUsername && (
              <button onClick={() => { setEditingUsername(true); setUsernameInput(profile.username ?? ""); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {editingUsername ? (
            <div className="flex gap-2">
              <Input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1 bg-muted/50 border-0 rounded-lg h-9"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
              />
              <Button size="sm" onClick={saveUsername} disabled={saving === "username"} className="gradient-brand border-0 text-white rounded-lg h-9 px-3">
                <Save className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)} className="rounded-lg h-9 px-3">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <p className="font-medium">{profile.username || <span className="text-muted-foreground italic">Not set</span>}</p>
          )}
        </motion.div>

        {/* Home city */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.15} className="glass rounded-2xl p-5 mb-4 relative z-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Home City</p>
          <div className="relative">
            <div
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setShowCityDropdown((v) => !v)}
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className={`flex-1 font-medium ${profile.city ? "text-foreground" : "text-muted-foreground"}`}>
                {profile.city || "Select a city"}
              </span>
              {showCityDropdown ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
                        onClick={() => selectCity(c)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                          c === profile.city ? "text-primary font-medium bg-primary/5" : "text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    {filteredCities.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">No cities found</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Favourite venues */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.2} className="glass rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Favourite Venues</p>
          {!profile.city ? (
            <p className="text-sm text-muted-foreground italic">Set your home city first</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TIERS.map((tier) => {
                const selected = profile.favourite_venues.includes(tier);
                const venueNames = cityVenues?.[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => toggleVenue(tier)}
                    className={`glass rounded-xl p-3 text-left transition-all ${
                      selected ? "border-primary/50 bg-primary/10" : "hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground leading-tight">{TIER_LABELS[tier]}</p>
                      {selected && <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
                    </div>
                    {venueNames && venueNames.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {venueNames.map((name) => (
                          <li key={name} className="text-xs text-muted-foreground leading-tight">{name}</li>
                        ))}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Favourite artists */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.25} className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Favourite Artists</p>

          {profile.favourite_artists.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.favourite_artists.map((id) => {
                const a = ARTISTS.find((a) => a.id === id);
                if (!a) return null;
                return (
                  <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full glass text-sm font-medium">
                    {a.name}
                    <button onClick={() => removeArtist(id)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="relative z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artists to add..."
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-0 rounded-xl h-10"
            />

          <AnimatePresence>
            {filteredArtists.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden shadow-xl z-20"
              >
                {filteredArtists.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => addArtist(a.id)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center gap-3"
                  >
                    <Music2 className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground text-xs ml-auto">{a.genre}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
