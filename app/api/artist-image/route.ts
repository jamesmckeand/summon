import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { searchArtist } from "@/lib/deezer-client";

// 30 requests per IP per minute
const ipThrottle = new Map<string, { count: number; resetAt: number }>();
function allowIp(ip: string): boolean {
  const now = Date.now();
  const entry = ipThrottle.get(ip);
  if (!entry || now > entry.resetAt) {
    ipThrottle.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function GET(request: Request) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!allowIp(ip)) return NextResponse.json({ image: null }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ image: null });

  const artist = await searchArtist(name);
  return NextResponse.json({ image: artist?.image ?? null }, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
