import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const providerToken = session.provider_token;

  // No token — return cached artists from profile
  if (!providerToken) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("favourite_artists")
      .eq("id", userId)
      .single();

    const cached = ARTISTS.filter((a) =>
      (profile?.favourite_artists ?? []).includes(a.id)
    );
    return NextResponse.json({ artists: cached, reason: "cached" });
  }

  try {
    const res = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term",
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );

    if (!res.ok) {
      // Spotify error — fall back to cache
      const { data: profile } = await supabase
        .from("profiles")
        .select("favourite_artists")
        .eq("id", userId)
        .single();

      const cached = ARTISTS.filter((a) =>
        (profile?.favourite_artists ?? []).includes(a.id)
      );
      return NextResponse.json({ artists: cached, reason: "cached" });
    }

    const data = await res.json();
    const spotifyNames = new Set(
      (data.items ?? []).map((a: { name: string }) => a.name.toLowerCase())
    );

    const matched = ARTISTS.filter((a) => spotifyNames.has(a.name.toLowerCase()));

    // Cache matched artist IDs to profile
    if (matched.length > 0) {
      await supabase
        .from("profiles")
        .update({ favourite_artists: matched.map((a) => a.id) })
        .eq("id", userId);
    }

    return NextResponse.json({ artists: matched });
  } catch {
    return NextResponse.json({ artists: [], reason: "error" });
  }
}
