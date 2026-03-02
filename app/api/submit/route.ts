import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { CITIES } from "@/lib/data/cities";
import { GENRES } from "@/lib/data/artists";

const VALID_CITIES = new Set(CITIES);
const VALID_GENRES = new Set(GENRES.filter((g) => g !== "All"));
const VALID_CAPACITIES = new Set(["small", "medium", "large", "arena"]);

async function validateArtistOnDeezer(name: string): Promise<{ validated: boolean; image: string | null }> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`
    );
    if (!res.ok) return { validated: false, image: null };
    const data = await res.json();
    const artist = data.data?.[0];
    if (!artist) return { validated: false, image: null };

    // Check name similarity — Deezer result must roughly match what was submitted
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = normalise(artist.name).includes(normalise(name)) ||
                  normalise(name).includes(normalise(artist.name));

    return {
      validated: match,
      image: match ? (artist.picture_medium ?? artist.picture ?? null) : null,
    };
  } catch {
    return { validated: false, image: null };
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to submit" }, { status: 401 });

  // Rate limit: max 5 submissions per user per 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("submitted_by", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Max 5 submissions per day" }, { status: 429 });
  }

  const body = await request.json();
  const { type } = body;

  if (type === "artist") {
    const { artist_name, artist_genre, artist_subgenre, artist_instagram, artist_spotify } = body;

    if (!artist_name?.trim()) return NextResponse.json({ error: "Artist name required" }, { status: 400 });
    if (!VALID_GENRES.has(artist_genre)) return NextResponse.json({ error: "Invalid genre" }, { status: 400 });

    const { validated, image } = await validateArtistOnDeezer(artist_name.trim());

    const { error } = await supabase.from("submissions").insert({
      type: "artist",
      artist_name: artist_name.trim(),
      artist_genre,
      artist_subgenre: artist_subgenre?.trim() || null,
      artist_instagram: artist_instagram?.trim() || null,
      artist_spotify: artist_spotify?.trim() || null,
      deezer_validated: validated,
      deezer_image: image,
      submitted_by: user.id,
      submitter_email: user.email ?? null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deezer_validated: validated });
  }

  if (type === "venue") {
    const { venue_city, venue_name, venue_capacity } = body;

    if (!VALID_CITIES.has(venue_city)) return NextResponse.json({ error: "Invalid city" }, { status: 400 });
    if (!venue_name?.trim()) return NextResponse.json({ error: "Venue name required" }, { status: 400 });
    if (!VALID_CAPACITIES.has(venue_capacity)) return NextResponse.json({ error: "Invalid capacity" }, { status: 400 });

    const { error } = await supabase.from("submissions").insert({
      type: "venue",
      venue_city,
      venue_name: venue_name.trim(),
      venue_capacity,
      submitted_by: user.id,
      submitter_email: user.email ?? null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
