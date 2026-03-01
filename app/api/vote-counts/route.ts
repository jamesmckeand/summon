import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  if (!city) return NextResponse.json({ error: "city required" }, { status: 400 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("artist_id, vote_count")
    .eq("city", city);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.artist_id] = Number(row.vote_count);

  return NextResponse.json({ counts });
}
