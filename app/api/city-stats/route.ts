import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vote_counts")
    .select("city, artist_id, vote_count")
    .order("vote_count", { ascending: false });

  // Aggregate totals and find top artist per city
  const cityMap: Record<string, { total: number; topArtistId: string }> = {};

  for (const row of data ?? []) {
    const count = Number(row.vote_count);
    if (!cityMap[row.city]) {
      cityMap[row.city] = { total: 0, topArtistId: row.artist_id };
    }
    cityMap[row.city].total += count;
  }

  const cities = Object.entries(cityMap)
    .map(([city, stats]) => ({
      city,
      totalVotes: stats.total,
      topArtistId: stats.topArtistId,
      topArtist: ARTISTS.find((a) => a.id === stats.topArtistId)?.name ?? null,
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  return NextResponse.json({ cities });
}
