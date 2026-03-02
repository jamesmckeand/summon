import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";

// Module-level cache — survives across requests on the same warm instance
let memCache: { images: Record<string, string | null>; builtAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  // Return from memory if fresh
  if (memCache && Date.now() - memCache.builtAt < CACHE_TTL) {
    return NextResponse.json({ images: memCache.images }, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
    });
  }

  // Fan out Deezer requests in batches of 20 to avoid overwhelming the API
  const BATCH = 20;
  const images: Record<string, string | null> = {};

  for (let i = 0; i < ARTISTS.length; i += BATCH) {
    const batch = ARTISTS.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (artist) => {
        const res = await fetch(
          `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist.name)}&limit=1`,
          { next: { revalidate: 86400 } }
        );
        if (!res.ok) return { name: artist.name, image: null };
        const data = await res.json();
        const a = data.data?.[0];
        return {
          name: artist.name,
          image: a?.picture_xl ?? a?.picture_medium ?? null,
        };
      })
    );
    results.forEach((r, j) => {
      images[batch[j].name] = r.status === "fulfilled" ? r.value.image : null;
    });
  }

  memCache = { images, builtAt: Date.now() };

  return NextResponse.json({ images }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
  });
}
