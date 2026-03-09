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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, city, favourite_venues, favourite_artists, created_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["username", "city", "favourite_venues", "favourite_artists"];
  const updates: Record<string, unknown> = { id: user.id };
  for (const key of allowed) {
    if (!(key in body)) continue;
    if (key === "username") {
      const trimmed = String(body[key] ?? "").trim().slice(0, 50);
      updates[key] = trimmed || null;
    } else if (key === "city") {
      const city = String(body[key] ?? "").trim();
      updates[key] = VALID_CITIES.has(city) ? city : null;
    } else if (key === "favourite_artists") {
      const ids = Array.isArray(body[key]) ? body[key] : [];
      updates[key] = ids
        .filter((id: unknown) => typeof id === "string" && (VALID_ARTIST_IDS.has(id) || /^(da_|dz-)/.test(id)))
        .slice(0, 200);
    } else if (key === "favourite_venues") {
      const venues = Array.isArray(body[key]) ? body[key] : [];
      updates[key] = venues.filter((v: unknown) => typeof v === "string").slice(0, 50);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(updates, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
