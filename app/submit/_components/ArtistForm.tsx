"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music2, Search, ChevronDown, ChevronUp, Send, AlertCircle, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENRES } from "@/lib/data/artists";

interface ArtistFormProps {
  onSuccess: (validated: boolean) => void;
}

export default function ArtistForm({ onSuccess }: ArtistFormProps) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [instagram, setInstagram] = useState("");
  const [spotify, setSpotify] = useState("");
  const [showGenre, setShowGenre] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setShowGenre(false);
        setGenreSearch("");
      }
    }
    if (showGenre) document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [showGenre]);

  const filteredGenres = useMemo(
    () => GENRES.filter((g) => g !== "All" && g.toLowerCase().includes(genreSearch.toLowerCase())),
    [genreSearch]
  );

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "artist",
          artist_name: name,
          artist_genre: genre,
          artist_subgenre: subgenre,
          artist_instagram: instagram,
          artist_spotify: spotify,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong");
      else onSuccess(!!data.deezer_validated);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = name.trim().length > 0 && genre.length > 0;

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
          Artist name <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="e.g. Amaarae" value={name} onChange={(e) => setName(e.target.value)}
            className="pl-9 bg-card border-border/60 rounded-xl h-11" />
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
            onClick={() => setShowGenre((v) => !v)}
          >
            <Music2 className="w-4 h-4 text-primary shrink-0" />
            <span className={`flex-1 text-sm ${genre ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {genre || "Select a genre"}
            </span>
            {showGenre ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
          <AnimatePresence>
            {showGenre && (
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
                    <button key={g} onClick={() => { setGenre(g); setShowGenre(false); setGenreSearch(""); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${g === genre ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}>
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
        <Input placeholder="e.g. Afropop, Bedroom Pop" value={subgenre} onChange={(e) => setSubgenre(e.target.value)}
          className="bg-card border-border/60 rounded-xl h-11" />
      </div>

      {/* Socials */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Instagram</label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="@handle" value={instagram} onChange={(e) => setInstagram(e.target.value)}
              className="pl-9 bg-card border-border/60 rounded-xl h-11" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Spotify URL</label>
          <div className="relative">
            <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="spotify.com/artist/…" value={spotify} onChange={(e) => setSpotify(e.target.value)}
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

      <Button onClick={submit} disabled={!canSubmit || submitting}
        className="w-full gradient-brand border-0 text-white h-11 rounded-xl font-semibold glow-primary-sm">
        <Send className="w-4 h-4 mr-2" />
        {submitting ? "Submitting…" : "Submit artist"}
      </Button>
    </div>
  );
}
