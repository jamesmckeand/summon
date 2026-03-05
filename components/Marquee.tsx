"use client";

import { useEffect, useState } from "react";
import { MapPin, ChevronUp, Music2 } from "lucide-react";
import { ARTISTS } from "@/lib/data/artists";
import Image from "next/image";
import Link from "next/link";

// Deterministic fallback votes for when DB has no data yet
function getFallbackVotes(id: string, city: string) {
  let hash = 0;
  for (const c of id + city) hash = (hash * 31 + c.charCodeAt(0)) & 0xfffffff;
  return 500 + (hash % 14500);
}

const ROW_ONE_CITIES = ["New York", "Los Angeles", "Chicago", "Toronto", "Miami"];
const ROW_TWO_CITIES = ["Seattle", "Nashville", "Austin", "Vancouver", "Atlanta"];

type MarqueeItem = { id: string; name: string; genre: string; city: string; votes: number };

function buildFallback(cities: string[], start: number): MarqueeItem[] {
  return ARTISTS.slice(start, start + 14).map((a, i) => ({
    id: a.id,
    name: a.name,
    genre: a.genre,
    city: cities[i % cities.length],
    votes: getFallbackVotes(a.id, cities[i % cities.length]),
  }));
}

function ArtistInitials({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
      {initials}
    </div>
  );
}

function ArtistCard({ id, name, genre, city, votes, image }: MarqueeItem & { image: string | null }) {
  return (
    <Link href={`/artist/${id}`} className="shrink-0 glass rounded-2xl px-4 py-3.5 flex items-center gap-3.5 w-64 mx-2 hover:border-primary/30 transition-colors">
      {image ? (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative">
          <Image src={image} alt={name} fill className="object-cover" sizes="40px" />
        </div>
      ) : (
        <ArtistInitials name={name} />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {city}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-primary font-bold text-sm flex items-center gap-0.5 justify-end">
          <ChevronUp className="w-3 h-3" />
          {votes.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end">
          <Music2 className="w-3 h-3" />
          {genre}
        </p>
      </div>
    </Link>
  );
}

export default function Marquee() {
  const [row1, setRow1] = useState<MarqueeItem[]>(() => buildFallback(ROW_ONE_CITIES, 0));
  const [row2, setRow2] = useState<MarqueeItem[]>(() => buildFallback(ROW_TWO_CITIES, 14));
  const [images, setImages] = useState<Record<string, string | null>>({});

  useEffect(() => {
    // Fetch real top-voted artist+city combos
    fetch("/api/top-votes")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length >= 10) {
          const half = Math.ceil(data.items.length / 2);
          setRow1(data.items.slice(0, half));
          setRow2(data.items.slice(half));
        }
      })
      .catch(() => {}); // keep fallback on error

    // Fetch images in parallel
    fetch("/api/artist-images")
      .then((r) => r.json())
      .then((data) => { if (data.images) setImages(data.images); })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full overflow-hidden mt-16 space-y-3 select-none">
      <div className="flex" style={{ animation: "marquee-left 40s linear infinite" }}>
        {[...row1, ...row1].map((a, i) => (
          <ArtistCard key={`r1-${i}`} {...a} image={images[a.name] ?? null} />
        ))}
      </div>
      <div className="flex" style={{ animation: "marquee-right 45s linear infinite" }}>
        {[...row2, ...row2].map((a, i) => (
          <ArtistCard key={`r2-${i}`} {...a} image={images[a.name] ?? null} />
        ))}
      </div>
    </div>
  );
}
