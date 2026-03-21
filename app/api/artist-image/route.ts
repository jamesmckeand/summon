import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { searchArtist } from "@/lib/deezer-client";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!await checkRateLimit(`artist-image:${ip}`, 30, 60)) return NextResponse.json({ image: null }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ image: null });

  const artist = await searchArtist(name);
  return NextResponse.json({ image: artist?.image ?? null }, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
