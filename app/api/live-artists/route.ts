import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_artists")
    .select("id, name, genre, subgenre, trending, deezer_image, instagram, spotify")
    .order("created_at", { ascending: false });

  return NextResponse.json({ artists: data ?? [] }, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
