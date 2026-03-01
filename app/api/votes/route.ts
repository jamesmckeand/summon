import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";

const VALID_ARTIST_IDS = new Set(ARTISTS.map((a) => a.id));
const VALID_CITIES = new Set(CITIES);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: votes } = await supabase
    .from("votes")
    .select("artist_id, city")
    .eq("user_id", user.id);

  return NextResponse.json({ votes: votes ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artistId, city } = await request.json();

  if (!VALID_ARTIST_IDS.has(artistId) || !VALID_CITIES.has(city)) {
    return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  const { error } = await supabase
    .from("votes")
    .insert({ user_id: user.id, artist_id: artistId, city });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artistId, city } = await request.json();

  if (!VALID_ARTIST_IDS.has(artistId) || !VALID_CITIES.has(city)) {
    return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .eq("city", city);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
