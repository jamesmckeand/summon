import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { CITIES } from "@/lib/data/cities";

const VALID_CITIES = new Set(CITIES);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  if (!city) return NextResponse.json({ error: "city required" }, { status: 400 });
  if (!VALID_CITIES.has(city)) return NextResponse.json({ counts: {} });

  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("artist_id, vote_count")
    .eq("city", city);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.artist_id] = Number(row.vote_count);

  return NextResponse.json({ counts });
}
