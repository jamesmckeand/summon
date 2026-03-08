"use client";

import { useState } from "react";
import { MapPin, Send, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CityDropdown from "@/components/CityDropdown";

const CAPACITY_OPTIONS = [
  { value: "small",  label: "Small (bar / club)", sub: "up to ~500" },
  { value: "medium", label: "Medium (theatre)",   sub: "500 – 2,000" },
  { value: "large",  label: "Large (concert hall)", sub: "2,000 – 10,000" },
  { value: "arena",  label: "Arena",              sub: "10,000+" },
];

interface VenueFormProps {
  onSuccess: () => void;
}

export default function VenueForm({ onSuccess }: VenueFormProps) {
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "venue", venue_city: city, venue_name: name, venue_capacity: capacity }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong");
      else onSuccess();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = city.length > 0 && name.trim().length > 0 && capacity.length > 0;

  return (
    <div className="space-y-4">
      {/* City */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
          City <span className="text-primary">*</span>
        </label>
        <CityDropdown value={city} onChange={setCity} />
      </div>

      {/* Venue name */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
          Venue name <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="e.g. The Fillmore" value={name} onChange={(e) => setName(e.target.value)}
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
            <button key={opt.value} onClick={() => setCapacity(opt.value)}
              className={`glass rounded-xl p-3 text-left transition-all ${capacity === opt.value ? "border-primary/50 bg-primary/10" : "hover:border-primary/20"}`}>
              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">How we use this:</span> the size you pick helps us assign the right venue tier (Bar → Theatre → Concert Hall → Arena). We'll verify the capacity before it goes live.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button onClick={submit} disabled={!canSubmit || submitting}
        className="w-full gradient-brand border-0 text-white h-11 rounded-xl font-semibold glow-primary-sm">
        <Send className="w-4 h-4 mr-2" />
        {submitting ? "Submitting…" : "Submit venue"}
      </Button>
    </div>
  );
}
