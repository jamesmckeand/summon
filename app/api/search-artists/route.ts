import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";

const staticNames = new Set(ARTISTS.map((a) => a.name.toLowerCase()));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ artists: [] });
  }

  const res = await fetch(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=8`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return NextResponse.json({ artists: [] });
  }

  const data = await res.json();
  const results = (data.data ?? [])
    .filter((a: { name: string }) => !staticNames.has(a.name.toLowerCase()))
    .map((a: { id: number; name: string; picture_medium?: string }) => ({
      id: `dz-${a.id}`,
      deezerId: a.id,
      name: a.name,
      image: a.picture_medium ?? null,
    }));

  return NextResponse.json(
    { artists: results },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
