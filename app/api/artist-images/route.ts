import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";

export async function GET() {
  const results = await Promise.allSettled(
    ARTISTS.map(async (artist) => {
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

  const images: Record<string, string | null> = {};
  results.forEach((r, i) => {
    images[ARTISTS[i].name] = r.status === "fulfilled" ? r.value.image : null;
  });

  return NextResponse.json({ images }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
  });
}
