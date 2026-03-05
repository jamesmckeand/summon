import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
    } else {
      updates[key] = body[key];
    }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(updates, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
