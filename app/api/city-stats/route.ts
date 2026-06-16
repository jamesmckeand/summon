import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vote_counts")
    .select("city, artist_id, vote_count")
    .order("vote_count", { ascending: false });
  if (error) return NextResponse.json({ cities: [] });

  // Aggregate totals and find top artist per city
  const cityMap: Record<string, { total: number; topArtistId: string }> = {};

  for (const row of data ?? []) {
    const count = Number(row.vote_count);
    if (!cityMap[row.city]) {
      cityMap[row.city] = { total: 0, topArtistId: row.artist_id };
    }
    cityMap[row.city].total += count;
  }

  // Resolve community artist names for top artists not in the static list
  const missingIds = Object.values(cityMap)
    .map(s => s.topArtistId)
    .filter(id => !ARTISTS.find(a => a.id === id));
  const liveMap = new Map<string, string>();
  if (missingIds.length > 0) {
    const { data: liveRows } = await supabase.from("live_artists").select("id, name").in("id", missingIds);
    for (const r of liveRows ?? []) liveMap.set(r.id, r.name);
  }

  const cities = Object.entries(cityMap)
    .map(([city, stats]) => ({
      city,
      totalVotes: stats.total,
      topArtistId: stats.topArtistId,
      topArtist: ARTISTS.find((a) => a.id === stats.topArtistId)?.name ?? liveMap.get(stats.topArtistId) ?? null,
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  return NextResponse.json({ cities }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
