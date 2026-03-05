"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, MapPin, Search, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Send, Instagram,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import { GENRES } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";

type Tab = "artist" | "venue";

const CAPACITY_OPTIONS = [
  { value: "small",  label: "Small (bar / club)", sub: "up to ~500" },
  { value: "medium", label: "Medium (theatre)",   sub: "500 – 2,000" },
  { value: "large",  label: "Large (concert hall)", sub: "2,000 – 10,000" },
  { value: "arena",  label: "Arena",              sub: "10,000+" },
];

export default function SubmitPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("artist");
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Artist form
  const [artistName, setArtistName] = useState("");
  const [artistGenre, setArtistGenre] = useState("");
  const [artistSubgenre, setArtistSubgenre] = useState("");
  const [artistInstagram, setArtistInstagram] = useState("");
  const [artistSpotify, setArtistSpotify] = useState("");

  // Venue form
  const [venueCity, setVenueCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");

  // Dropdowns
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const genreRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; validated?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, []);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setShowGenreDropdown(false); setGenreSearch("");
      }
    }
    if (showGenreDropdown) document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [showGenreDropdown]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false); setCitySearch("");
      }
    }
    if (showCityDropdown) document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [showCityDropdown]);

  const filteredGenres = useMemo(
    () => GENRES.filter((g) => g !== "All" && g.toLowerCase().includes(genreSearch.toLowerCase())),
    [genreSearch]
  );
  const filteredCities = useMemo(
    () => CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );

  async function submit() {
    setError(null);
    setResult(null);
    setSubmitting(true);

    const body = tab === "artist"
      ? { type: "artist", artist_name: artistName, artist_genre: artistGenre,
          artist_subgenre: artistSubgenre, artist_instagram: artistInstagram,
          artist_spotify: artistSpotify }
      : { type: "venue", venue_city: venueCity, venue_name: venueName, venue_capacity: venueCapacity };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); }
      else { setResult({ ok: true, validated: data.deezer_validated }); }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const artistValid = artistName.trim().length > 0 && artistGenre.length > 0;
  const venueValid = venueCity.length > 0 && venueName.trim().length > 0 && venueCapacity.length > 0;
  const canSubmit = tab === "artist" ? artistValid : venueValid;

  if (authed === false) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 text-center px-6">
          <Music2 className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-2xl font-bold mb-2">Sign in to submit</h1>
          <p className="text-muted-foreground mb-6">You need an account to suggest artists or venues.</p>
          <Button className="gradient-brand border-0 text-white" onClick={() => router.push("/login")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Suggest an addition</h1>
          <p className="text-muted-foreground mt-1">
            Know an artist or venue we're missing? Let us know — we review every submission.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="flex gap-2 mb-6">
          {(["artist", "venue"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setResult(null); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "gradient-brand text-white border-0" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "artist" ? "Artist" : "Venue"}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Submitted — thanks!</h2>
              {tab === "artist" && (
                <p className="text-muted-foreground text-sm mb-1">
                  {result.validated
                    ? "✓ Verified on Deezer — this artist looks real."
                    : "We couldn't auto-verify this artist, but we'll review manually."}
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                We'll review it and add it to the app if it's a good fit.
              </p>
              <div className="mt-6 flex gap-3 justify-center flex-wrap">
                <Button
                  className="gradient-brand border-0 text-white"
                  onClick={() => { setResult(null); setArtistName(""); setArtistGenre(""); setArtistSubgenre(""); setArtistInstagram(""); setArtistSpotify(""); setVenueCity(""); setVenueName(""); setVenueCapacity(""); }}
                >
                  Submit another
                </Button>
                <Link href="/explore">
                  <Button variant="outline" className="border-border/50">
                    Explore artists
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : tab === "artist" ? (
            <motion.div key="artist" initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="space-y-4">

              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Artist name <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Amaarae"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="pl-9 bg-card border-border/60 rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Genre <span className="text-primary">*</span>
                </label>
                <div className="relative" ref={genreRef}>
                  <div
                    className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors h-11"
                    onClick={() => setShowGenreDropdown((v) => !v)}
                  >
                    <Music2 className="w-4 h-4 text-primary shrink-0" />
                    <span className={`flex-1 text-sm ${artistGenre ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {artistGenre || "Select a genre"}
                    </span>
                    {showGenreDropdown ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <AnimatePresence>
                    {showGenreDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
                      >
                        <div className="p-3 border-b border-border/50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search genres..." value={genreSearch} onChange={(e) => setGenreSearch(e.target.value)}
                              className="pl-9 bg-muted/50 border-0 h-9 rounded-lg" autoFocus />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredGenres.map((g) => (
                            <button key={g} onClick={() => { setArtistGenre(g); setShowGenreDropdown(false); setGenreSearch(""); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${g === artistGenre ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Subgenre */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Subgenre <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. Afropop, Bedroom Pop"
                  value={artistSubgenre}
                  onChange={(e) => setArtistSubgenre(e.target.value)}
                  className="bg-card border-border/60 rounded-xl h-11"
                />
              </div>

              {/* Socials */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="@handle" value={artistInstagram} onChange={(e) => setArtistInstagram(e.target.value)}
                      className="pl-9 bg-card border-border/60 rounded-xl h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Spotify URL</label>
                  <div className="relative">
                    <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="spotify.com/artist/…" value={artistSpotify} onChange={(e) => setArtistSpotify(e.target.value)}
                      className="pl-9 bg-card border-border/60 rounded-xl h-11" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                We'll check if this artist exists on Deezer automatically. If not found we'll still review it manually.
              </p>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <Button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="w-full gradient-brand border-0 text-white h-11 rounded-xl font-semibold glow-primary-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting…" : "Submit artist"}
              </Button>
            </motion.div>

          ) : (
            <motion.div key="venue" initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="space-y-4">

              {/* City */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  City <span className="text-primary">*</span>
                </label>
                <div className="relative" ref={cityRef}>
                  <div
                    className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors h-11"
                    onClick={() => setShowCityDropdown((v) => !v)}
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className={`flex-1 text-sm ${venueCity ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {venueCity || "Select a city"}
                    </span>
                    {showCityDropdown ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <AnimatePresence>
                    {showCityDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
                      >
                        <div className="p-3 border-b border-border/50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search cities..." value={citySearch} onChange={(e) => setCitySearch(e.target.value)}
                              className="pl-9 bg-muted/50 border-0 h-9 rounded-lg" autoFocus />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCities.map((c) => (
                            <button key={c} onClick={() => { setVenueCity(c); setShowCityDropdown(false); setCitySearch(""); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${c === venueCity ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}>
                              {c}
                            </button>
                          ))}
                          {filteredCities.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">No cities found</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Venue name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Venue name <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="e.g. The Fillmore" value={venueName} onChange={(e) => setVenueName(e.target.value)}
                    className="pl-9 bg-card border-border/60 rounded-xl h-11" />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Approximate size <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CAPACITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setVenueCapacity(opt.value)}
                      className={`glass rounded-xl p-3 text-left transition-all ${
                        venueCapacity === opt.value ? "border-primary/50 bg-primary/10" : "hover:border-primary/20"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">How we use this:</span> the size you pick helps us assign the right venue tier (Bar → Theatre → Concert Hall → Arena). We'll verify the capacity and confirm the tier before it goes live.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <Button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="w-full gradient-brand border-0 text-white h-11 rounded-xl font-semibold glow-primary-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting…" : "Submit venue"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status badge */}
        {!result && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.3} className="mt-8 flex items-center justify-center gap-2">
            <Badge className="bg-muted text-muted-foreground border-border/40 text-xs">
              All submissions are reviewed before going live
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}
