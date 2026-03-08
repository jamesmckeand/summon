import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

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
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
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
    const appleNames = new Set(
      (data.data ?? []).map((a: { attributes: { name: string } }) =>
        a.attributes.name.toLowerCase()
      )
    );

    const matched = ARTISTS.filter((a) => appleNames.has(a.name.toLowerCase()));

    // Merge into profile's favourite_artists without overwriting Spotify ones
    if (matched.length > 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("favourite_artists")
        .eq("id", session.user.id)
        .single();

      const existing: string[] = profile?.favourite_artists ?? [];
      const newIds = matched.map((a) => a.id).filter((id) => !existing.includes(id));

      if (newIds.length > 0) {
        await supabase
          .from("profiles")
          .update({ favourite_artists: [...existing, ...newIds] })
          .eq("id", session.user.id);
      }
    }

    return NextResponse.json({ artists: matched });
  } catch {
    return NextResponse.json({ artists: [], reason: "error" });
  }
}
