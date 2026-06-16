import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";

const ARTIST_MAP = new Map(ARTISTS.map((a) => [a.id, a]));

export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vote_counts")
    .select("artist_id, city, vote_count")
    .order("vote_count", { ascending: false })
    .limit(40);

  if (!data || data.length === 0) {
    return NextResponse.json({ items: [] }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  }

  // Resolve community artist IDs not in the static map
  const unknownIds = data.filter(r => !ARTIST_MAP.has(r.artist_id)).map(r => r.artist_id);
  let liveArtistMap = new Map<string, { name: string; genre: string }>();
  if (unknownIds.length > 0) {
    const { data: liveRows } = await supabase
      .from("live_artists")
      .select("id, name, genre")
      .in("id", unknownIds);
    for (const a of liveRows ?? []) liveArtistMap.set(a.id, { name: a.name, genre: a.genre });
  }

  const items = data
    .map((row) => {
      const artist = ARTIST_MAP.get(row.artist_id);
      if (artist) return { id: artist.id, name: artist.name, genre: artist.genre, city: row.city, votes: row.vote_count };
      const live = liveArtistMap.get(row.artist_id);
      if (live) return { id: row.artist_id, name: live.name, genre: live.genre, city: row.city, votes: row.vote_count };
      return null;
    })
    .filter(Boolean);

  return NextResponse.json({ items }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
  });
}
