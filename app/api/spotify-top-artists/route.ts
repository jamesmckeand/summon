import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";
import type { SupabaseClient } from "@supabase/supabase-js";

type ArtistLike = { id: string; name: string; genre: string; subgenre?: string };

async function resolveViaDeezer(names: string[], supabase: SupabaseClient): Promise<ArtistLike[]> {
  const results = await Promise.all(
    names.slice(0, 25).map(async (name) => {
      try {
        const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=3`);
        if (!res.ok) return null;
        const data = await res.json();
        const match = (data.data ?? []).find(
          (a: { name: string }) => a.name.toLowerCase() === name.toLowerCase()
        );
        if (!match) return null;
        const id = `dz-${match.id}`;
        await supabase.from("live_artists").upsert(
          { id, name: match.name, genre: "Music", deezer_image: match.picture_medium ?? null, source_id: null },
          { onConflict: "id" }
        );
        return { id, name: match.name, genre: "Music" } as ArtistLike;
      } catch { return null; }
    })
  );
  return results.filter((r): r is ArtistLike => r !== null);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const { data: { session } } = await supabase.auth.getSession();
  const providerToken = session?.provider_token;

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
    const spotifyItems: { name: string }[] = data.items ?? [];
    const spotifyNames = new Set(spotifyItems.map((a) => a.name.toLowerCase()));

    const matched = ARTISTS.filter((a) => spotifyNames.has(a.name.toLowerCase()));
    const matchedNames = new Set(matched.map((a) => a.name.toLowerCase()));
    const unmatchedNames = spotifyItems
      .map((a) => a.name)
      .filter((n) => !matchedNames.has(n.toLowerCase()));

    const resolved = await resolveViaDeezer(unmatchedNames, supabase);
    const all = [...matched, ...resolved];

    // Cache all artist IDs to profile
    if (all.length > 0) {
      await supabase
        .from("profiles")
        .update({ favourite_artists: all.map((a) => a.id) })
        .eq("id", userId);
    }

    return NextResponse.json({ artists: all });
  } catch {
    return NextResponse.json({ artists: [], reason: "error" });
  }
}
