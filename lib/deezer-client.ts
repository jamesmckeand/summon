/**
 * Deezer API helper — no auth required, server-side only.
 * Used for artist images and top tracks.
 */

const BASE = "https://api.deezer.com";

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type DeezerArtist = {
  id: number;
  name: string;
  image: string | null;
};

/** Search for an artist by name. Returns null if no confident match. */
export async function searchArtist(name: string): Promise<DeezerArtist | null> {
  const res = await fetch(
    `${BASE}/search/artist?q=${encodeURIComponent(name)}&limit=3`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;

  const data = await res.json();
  const items: { id: number; name: string; picture_medium: string; picture_big: string }[] =
    data.data ?? [];

  const nameNorm = normalise(name);
  const match =
    items.find((a) => normalise(a.name) === nameNorm) ??
    items.find(
      (a) =>
        normalise(a.name).includes(nameNorm) || nameNorm.includes(normalise(a.name))
    );

  if (!match) return null;

  const image = match.picture_big || match.picture_medium || null;
  return { id: match.id, name: match.name, image };
}

export type DeezerTrack = {
  title: string;
  preview: string | null;
  link: string;
};

/** Fetch up to 5 top tracks for a known Deezer artist ID. */
export async function getTopTracks(artistId: number): Promise<DeezerTrack[]> {
  const res = await fetch(
    `${BASE}/artist/${artistId}/top?limit=5`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.data ?? []).slice(0, 5).map(
    (t: { title: string; preview: string; link: string }) => ({
      title: t.title,
      preview: t.preview || null,
      link: t.link,
    })
  );
}
