import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";

export async function GET() {
  const supabase = await createClient();

  const [votesResult, liveArtistsResult] = await Promise.all([
    supabase.from("votes").select("id", { count: "exact", head: true }),
    supabase.from("live_artists").select("id", { count: "exact", head: true }),
  ]);

  const totalVotes = votesResult.count ?? 0;
  const dynamicArtists = liveArtistsResult.count ?? 0;

  return NextResponse.json({
    totalVotes,
    artistCount: ARTISTS.length + dynamicArtists,
    cityCount: CITIES.length,
  }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
