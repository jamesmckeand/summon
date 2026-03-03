/**
 * Spotify Client Credentials helper — server-side only.
 * Used for artist search, images, and top tracks without requiring a user session.
 */

type TokenCache = { token: string; expiresAt: number } | null;
let tokenCache: TokenCache = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    // Don't cache the token fetch itself — we manage expiry manually
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return tokenCache.token;
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type SpotifyArtist = {
  id: string;
  name: string;
  image: string | null;
};

/** Search for an artist by name. Returns null if no confident match. */
export async function searchArtist(name: string): Promise<SpotifyArtist | null> {
  const token = await getToken();
  if (!token) return null;

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=3`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) return null;

  const data = await res.json();
  const items: { id: string; name: string; images: { url: string }[] }[] =
    data.artists?.items ?? [];

  // Find the best name match — exact first, then prefix/contains
  const nameNorm = normalise(name);
  const match =
    items.find((a) => normalise(a.name) === nameNorm) ??
    items.find(
      (a) =>
        normalise(a.name).includes(nameNorm) || nameNorm.includes(normalise(a.name))
    );

  if (!match) return null;

  // Prefer a mid-size image (index 1 ≈ 300px) for cards; index 0 for detail pages
  const image = match.images[0]?.url ?? null;
  return { id: match.id, name: match.name, image };
}

export type SpotifyTrack = {
  title: string;
  preview: string | null;
  link: string;
};

/** Fetch up to 5 top tracks for a known Spotify artist ID. */
export async function getTopTracks(artistId: string): Promise<SpotifyTrack[]> {
  const token = await getToken();
  if (!token) return [];

  const res = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.tracks ?? []).slice(0, 5).map(
    (t: { name: string; preview_url: string | null; external_urls: { spotify: string } }) => ({
      title: t.name,
      preview: t.preview_url,
      link: t.external_urls.spotify,
    })
  );
}
