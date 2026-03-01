import type { Metadata } from "next";
import { ARTISTS } from "@/lib/data/artists";
import { createClient } from "@/lib/supabase/server";
import ArtistClient from "./ArtistClient";

async function getDeezerImage(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const artist = data.data?.[0];
    return artist?.picture_xl ?? artist?.picture_medium ?? null;
  } catch {
    return null;
  }
}

async function findArtist(id: string) {
  const static_ = ARTISTS.find((a) => a.id === id);
  if (static_) return static_;
  // Check live_artists table for community-approved artists
  const supabase = await createClient();
  const { data } = await supabase.from("live_artists").select("*").eq("id", id).single();
  return data ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const artist = await findArtist(id);

  if (!artist) {
    return { title: "Artist not found | Summon" };
  }

  const image = await getDeezerImage(artist.name);
  const title = `${artist.name} | Summon`;
  const description = `Vote for ${artist.name} to come to your city. ${artist.genre}${artist.subgenre ? ` · ${artist.subgenre}` : ""}. Join Summon and make it happen.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image, width: 500, height: 500, alt: artist.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ArtistPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return <ArtistClient id={id} />;
}
