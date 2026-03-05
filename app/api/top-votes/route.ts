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

  const items = data
    .map((row) => {
      const artist = ARTIST_MAP.get(row.artist_id);
      if (!artist) return null;
      return {
        id: artist.id,
        name: artist.name,
        genre: artist.genre,
        city: row.city,
        votes: row.vote_count,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ items }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
  });
}
