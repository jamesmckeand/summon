import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";

const VALID_ARTIST_IDS = new Set(ARTISTS.map((a) => a.id));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId");
  if (!artistId) return NextResponse.json({ error: "artistId required" }, { status: 400 });
  if (!VALID_ARTIST_IDS.has(artistId)) return NextResponse.json({ cityVotes: [] });

  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("city, vote_count")
    .eq("artist_id", artistId)
    .order("vote_count", { ascending: false });

  const cityVotes = (data ?? []).map((row) => ({
    city: row.city,
    vote_count: Number(row.vote_count),
  }));

  return NextResponse.json({ cityVotes }, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
  });
}
