"use client";

import { useEffect, useState } from "react";
import { MapPin, ChevronUp, Music2 } from "lucide-react";
import { ARTISTS } from "@/lib/data/artists";
import Image from "next/image";

function getVotes(id: string, city: string) {
  let hash = 0;
  for (const c of id + city) hash = (hash * 31 + c.charCodeAt(0)) & 0xfffffff;
  return 500 + (hash % 14500);
}

const ROW_ONE_CITIES = ["New York", "Los Angeles", "Chicago", "Toronto", "Miami"];
const ROW_TWO_CITIES = ["Seattle", "Nashville", "Austin", "Vancouver", "Atlanta"];

function buildRow(cities: string[], start: number) {
  return ARTISTS.slice(start, start + 14).map((a, i) => ({
    ...a,
    city: cities[i % cities.length],
    votes: getVotes(a.id, cities[i % cities.length]),
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

function ArtistCard({
  name, genre, city, votes, image,
}: {
  name: string; genre: string; city: string; votes: number; image: string | null;
}) {
  return (
    <div className="shrink-0 glass rounded-2xl px-4 py-3.5 flex items-center gap-3.5 w-64 mx-2 hover:border-primary/30 transition-colors">
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
    </div>
  );
}

export default function Marquee() {
  const row1 = buildRow(ROW_ONE_CITIES, 0);
  const row2 = buildRow(ROW_TWO_CITIES, 14);
  const [images, setImages] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const names = [...new Set([...row1, ...row2].map((a) => a.name))];
    names.forEach(async (name) => {
      try {
        const res = await fetch(`/api/artist-image?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.image) {
          setImages((prev) => ({ ...prev, [name]: data.image }));
        }
      } catch {
        // fallback to initials
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full overflow-hidden mt-16 space-y-3 select-none">
      <div className="flex" style={{ animation: "marquee-left 40s linear infinite" }}>
        {[...row1, ...row1].map((a, i) => (
          <ArtistCard key={`r1-${i}`} name={a.name} genre={a.genre} city={a.city} votes={a.votes} image={images[a.name] ?? null} />
        ))}
      </div>
      <div className="flex" style={{ animation: "marquee-right 45s linear infinite" }}>
        {[...row2, ...row2].map((a, i) => (
          <ArtistCard key={`r2-${i}`} name={a.name} genre={a.genre} city={a.city} votes={a.votes} image={images[a.name] ?? null} />
        ))}
      </div>
    </div>
  );
}
