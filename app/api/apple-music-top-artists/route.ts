import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
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

async function getDeveloperToken() {
  const pem = process.env.APPLE_MUSIC_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pem, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_MUSIC_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { musicUserToken } = await req.json();
  if (!musicUserToken) {
    return NextResponse.json({ error: "No Music User Token" }, { status: 400 });
  }

  try {
    const developerToken = await getDeveloperToken();

    const res = await fetch(
      "https://api.music.apple.com/v1/me/library/artists?limit=100",
      {
        headers: {
          Authorization: `Bearer ${developerToken}`,
          "Music-User-Token": musicUserToken,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ artists: [], reason: "apple_error" });
    }

    const data = await res.json();
    const appleItems: { attributes: { name: string } }[] = data.data ?? [];
    const appleNames = new Set(appleItems.map((a) => a.attributes.name.toLowerCase()));

    const matched = ARTISTS.filter((a) => appleNames.has(a.name.toLowerCase()));
    const matchedNames = new Set(matched.map((a) => a.name.toLowerCase()));
    const unmatchedNames = appleItems
      .map((a) => a.attributes.name)
      .filter((n) => !matchedNames.has(n.toLowerCase()));

    const resolved = await resolveViaDeezer(unmatchedNames, supabase);
    const all = [...matched, ...resolved];

    // Merge into profile's favourite_artists without overwriting Spotify ones
    if (all.length > 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("favourite_artists")
        .eq("id", user.id)
        .single();

      const existing: string[] = profile?.favourite_artists ?? [];
      const newIds = all.map((a) => a.id).filter((id) => !existing.includes(id));

      if (newIds.length > 0) {
        await supabase
          .from("profiles")
          .update({ favourite_artists: [...existing, ...newIds] })
          .eq("id", user.id);
      }
    }

    return NextResponse.json({ artists: all });
  } catch {
    return NextResponse.json({ artists: [], reason: "error" });
  }
}
