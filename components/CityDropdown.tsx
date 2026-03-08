"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/data/cities";

interface CityDropdownProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityDropdown({ value, onChange, placeholder = "Select a city", className = "" }: CityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  function select(city: string) {
    onChange(city);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <span className={`flex-1 font-medium text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value || placeholder}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {open && (
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/50 border-0 h-9 rounded-lg"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c}
                  onClick={() => select(c)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                    c === value ? "text-primary font-medium bg-primary/5" : "text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">No cities found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
