import { NextResponse } from "next/server";
import { searchArtist } from "@/lib/spotify-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ image: null });

  const artist = await searchArtist(name);
  return NextResponse.json({ image: artist?.image ?? null }, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
