import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deezerId, name, image } = await request.json();

  if (!deezerId || !name) {
    return NextResponse.json({ error: "Missing deezerId or name" }, { status: 400 });
  }
  // Validate deezerId is a positive integer (Deezer IDs are always numeric)
  if (!/^\d+$/.test(String(deezerId))) {
    return NextResponse.json({ error: "Invalid deezerId" }, { status: 400 });
  }
  const cleanName = String(name).trim().slice(0, 100);
  if (!cleanName) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  // Only accept Deezer CDN image URLs or null
  const cleanImage = typeof image === "string" && /^https:\/\/[^"<>]*\.deezer\.com\/[^"<>]+$/.test(image)
    ? image : null;

  const id = `dz-${deezerId}`;

  const { error } = await supabase
    .from("live_artists")
    .upsert(
      { id, name: cleanName, genre: "Music", deezer_image: cleanImage, source_id: null },
      { onConflict: "id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id });
}
