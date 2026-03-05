import { NextResponse } from "next/server";
import { searchArtist, getTopTracks } from "@/lib/deezer-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ tracks: [] });

  const artist = await searchArtist(name);
  if (!artist) return NextResponse.json({ tracks: [] });

  const tracks = await getTopTracks(artist.id);
  return NextResponse.json({ tracks }, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
