"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, ChevronUp, Check, X, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { createClient } from "@/lib/supabase/client";

const VENUE_TIERS = ["bar", "theatre", "concertHall", "arena"] as const;
const TIER_LABELS: Record<string, string> = {
  bar: "Bar / Club (~200)",
  theatre: "Theatre (~1,000)",
  concertHall: "Concert Hall (~3,000)",
  arena: "Arena (~15,000)",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [favVenues, setFavVenues] = useState<string[]>([]);
  const [favArtists, setFavArtists] = useState<string[]>([]);
  const [artistSearch, setArtistSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [spotifyMatches, setSpotifyMatches] = useState<typeof ARTISTS>([]);
  const [loadingSpotify, setLoadingSpotify] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const name = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "";
      if (name) setUsername(name);
    });

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.username) setUsername(data.profile.username);
      })
      .catch(() => {});
  }, [router]);

  const filteredCities = useMemo(
    () => CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );

  const cityVenues = city ? getVenuesForCity(city) : null;

  // When entering step 3, fetch Spotify top artists
  useEffect(() => {
    if (step !== 3) return;
    setLoadingSpotify(true);
    fetch("/api/spotify-top-artists")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.artists) && data.artists.length > 0) {
          setSpotifyMatches(data.artists);
          setFavArtists((prev) => {
            const newIds = data.artists.map((a: { id: string }) => a.id).filter((id: string) => !prev.includes(id));
            return [...prev, ...newIds];
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSpotify(false));
  }, [step]);

  const filteredArtists = useMemo(() => {
    if (!artistSearch.trim()) return [];
    return ARTISTS.filter(
      (a) =>
        a.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
        !favArtists.includes(a.id)
    ).slice(0, 8);
  }, [artistSearch, favArtists]);

  function toggleVenue(tier: string) {
    setFavVenues((prev) =>
      prev.includes(tier) ? prev.filter((v) => v !== tier) : [...prev, tier]
    );
  }

  function addArtist(id: string) {
    setFavArtists((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setArtistSearch("");
  }

  function removeArtist(id: string) {
    setFavArtists((prev) => prev.filter((a) => a !== id));
  }

  async function finish() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim() || undefined,
        city,
        favourite_venues: favVenues,
        favourite_artists: favArtists,
      }),
    }).catch(() => {});
    router.push("/explore");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/50" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              variants={fadeUp}
              custom={0}
            >
              <h1 className="text-3xl font-bold tracking-tight mb-2">What should we call you?</h1>
              <p className="text-muted-foreground mb-8">This is your display name on Summon.</p>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="bg-card border-border/60 rounded-xl h-12 text-base mb-6"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && setStep(2)}
              />
              <Button
                className="w-full gradient-brand border-0 text-white h-12 rounded-xl font-semibold text-base glow-primary-sm"
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </motion.div>
          )}

          {/* Step 2 — City */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              variants={fadeUp}
              custom={0}
            >
              <h1 className="text-3xl font-bold tracking-tight mb-2">Where are you based?</h1>
              <p className="text-muted-foreground mb-8">We'll show you venues and votes for your city.</p>

              <div className="relative mb-6">
                <div
                  className="glass rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => setShowCityDropdown((v) => !v)}
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className={`flex-1 ${city ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {city || "Select your city"}
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
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCities.map((c) => (
                          <button
                            key={c}
                            onClick={() => { setCity(c); setShowCityDropdown(false); setCitySearch(""); setFavVenues([]); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                              c === city ? "text-primary font-medium bg-primary/5" : "text-foreground"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                        {filteredCities.length === 0 && (
                          <p className="px-4 py-3 text-sm text-muted-foreground">No cities found</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 gradient-brand border-0 text-white h-12 rounded-xl font-semibold glow-primary-sm"
                  disabled={!city}
                  onClick={() => setStep(3)}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Venues & Artists */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              variants={fadeUp}
              custom={0}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Your favourites</h1>
                <p className="text-muted-foreground">Pick venues and artists you love in {city}.</p>
              </div>

              {/* Venues */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Venues you'd attend
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {VENUE_TIERS.map((tier) => {
                    const selected = favVenues.includes(tier);
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
              </div>

              {/* Artists */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Artists you'd love to see
                  </p>
                  {loadingSpotify && (
                    <span className="text-xs text-[#1DB954] animate-pulse">Importing from Spotify…</span>
                  )}
                  {!loadingSpotify && spotifyMatches.length > 0 && (
                    <span className="text-xs text-[#1DB954]">✓ {spotifyMatches.length} imported from Spotify</span>
                  )}
                </div>

                {/* Selected chips */}
                {favArtists.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {favArtists.map((id) => {
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

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search artists..."
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                    className="pl-9 bg-card border-border/60 rounded-xl h-10"
                  />
                </div>

                <AnimatePresence>
                  {filteredArtists.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 glass rounded-xl overflow-hidden"
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

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 gradient-brand border-0 text-white h-12 rounded-xl font-semibold glow-primary-sm"
                  disabled={saving}
                  onClick={finish}
                >
                  {saving ? "Saving…" : "Finish"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
