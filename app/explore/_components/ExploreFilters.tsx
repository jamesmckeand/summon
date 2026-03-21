"use client";

import { useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, Music2, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/data/cities";
import { GENRES } from "@/lib/data/artists";

interface ExploreFiltersProps {
  selectedCity: string;
  selectedGenre: string;
  artistSearch: string;
  onCityChange: (city: string) => void;
  onGenreChange: (genre: string) => void;
  onArtistSearchChange: (q: string) => void;
}

export default function ExploreFilters({
  selectedCity,
  selectedGenre,
  artistSearch,
  onCityChange,
  onGenreChange,
  onArtistSearchChange,
}: ExploreFiltersProps) {
  const [citySearch, setCitySearch] = useState("");
  const [genreSearch, setGenreSearch] = useState("");
  const [showCity, setShowCity] = useState(false);
  const [showGenre, setShowGenre] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  const filteredCities = useMemo(
    () => CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );
  const filteredGenres = useMemo(
    () => GENRES.filter((g) => g.toLowerCase().includes(genreSearch.toLowerCase())),
    [genreSearch]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* City */}
        <div className="relative" ref={cityRef}>
          <button
            className={`glass rounded-xl px-4 py-3 flex items-center gap-3 w-full transition-colors h-11 ${
              !selectedCity
                ? "border-primary/30 hover:border-primary/50 bg-primary/5"
                : "hover:border-primary/30"
            }`}
            onClick={() => { setShowCity((v) => !v); setShowGenre(false); }}
            aria-haspopup="listbox"
            aria-expanded={showCity}
            aria-controls="explore-city-list"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span className={`font-medium flex-1 text-sm truncate text-left ${!selectedCity ? "text-primary" : ""}`}>
              {selectedCity || "Select city"}
            </span>
            {showCity
              ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />}
          </button>
          <AnimatePresence>
            {showCity && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
              >
                <div className="p-3 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <label htmlFor="explore-city-search" className="sr-only">Search cities</label>
                    <Input
                      id="explore-city-search"
                      placeholder="Search cities..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="pl-9 bg-muted/50 border-0 h-9 rounded-lg"
                      autoFocus
                    />
                  </div>
                </div>
                <div id="explore-city-list" role="listbox" className="max-h-60 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => { onCityChange(city); setShowCity(false); setCitySearch(""); }}
                      role="option"
                      aria-selected={city === selectedCity}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                        city === selectedCity ? "text-primary font-medium bg-primary/5" : "text-foreground"
                      }`}
                    >
                      {city}
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

        {/* Artist search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="explore-artist-search" className="sr-only">Search artists</label>
          <Input
            id="explore-artist-search"
            placeholder="Search artists..."
            value={artistSearch}
            onChange={(e) => onArtistSearchChange(e.target.value)}
            className="pl-9 bg-card border-border/60 rounded-xl h-11"
          />
        </div>

        {/* Genre */}
        <div className="relative" ref={genreRef}>
          <button
            className="glass rounded-xl px-4 py-3 flex items-center gap-3 w-full hover:border-primary/30 transition-colors h-11"
            onClick={() => { setShowGenre((v) => !v); setShowCity(false); }}
            aria-haspopup="listbox"
            aria-expanded={showGenre}
            aria-controls="explore-genre-list"
          >
            <Music2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span className={`flex-1 text-sm truncate text-left ${selectedGenre === "All" ? "text-muted-foreground" : "font-medium text-foreground"}`}>
              {selectedGenre === "All" ? "All genres" : selectedGenre}
            </span>
            {showGenre
              ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />}
          </button>
          <AnimatePresence>
            {showGenre && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-40 shadow-xl"
              >
                <div className="p-3 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <label htmlFor="explore-genre-search" className="sr-only">Search genres</label>
                    <Input
                      id="explore-genre-search"
                      placeholder="Search genres..."
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      className="pl-9 bg-muted/50 border-0 h-9 rounded-lg"
                      autoFocus
                    />
                  </div>
                </div>
                <div id="explore-genre-list" role="listbox" className="max-h-60 overflow-y-auto">
                  {filteredGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => { onGenreChange(genre); setShowGenre(false); setGenreSearch(""); }}
                      role="option"
                      aria-selected={genre === selectedGenre}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                        genre === selectedGenre ? "text-primary font-medium bg-primary/5" : "text-foreground"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                  {filteredGenres.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No genres found</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
