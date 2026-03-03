import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";
import { searchArtist } from "@/lib/spotify-client";

export const revalidate = 86400;

// Module-level cache — survives across requests on the same warm instance
let memCache: { images: Record<string, string | null>; builtAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  if (memCache && Date.now() - memCache.builtAt < CACHE_TTL) {
    return NextResponse.json({ images: memCache.images }, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
    });
  }

  // Fan out Spotify requests in batches of 10 to stay within rate limits
  const BATCH = 10;
  const images: Record<string, string | null> = {};

  for (let i = 0; i < ARTISTS.length; i += BATCH) {
    const batch = ARTISTS.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (artist) => {
        const result = await searchArtist(artist.name);
        return { name: artist.name, image: result?.image ?? null };
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
