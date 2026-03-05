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

  const id = `dz-${deezerId}`;

  const { error } = await supabase
    .from("live_artists")
    .upsert(
      { id, name, genre: "Music", deezer_image: image ?? null, source_id: null },
      { onConflict: "id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id });
}
