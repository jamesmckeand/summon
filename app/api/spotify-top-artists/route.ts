import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerToken = session.provider_token;
  if (!providerToken) {
    return NextResponse.json({ artists: [], reason: "no_spotify_token" });
  }

  try {
    const res = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term",
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ artists: [], reason: "spotify_error" });
    }

    const data = await res.json();
    const spotifyNames = new Set(
      (data.items ?? []).map((a: { name: string }) => a.name.toLowerCase())
    );

    const matched = ARTISTS.filter((a) => spotifyNames.has(a.name.toLowerCase()));

    return NextResponse.json({ artists: matched });
  } catch {
    return NextResponse.json({ artists: [], reason: "error" });
  }
}
