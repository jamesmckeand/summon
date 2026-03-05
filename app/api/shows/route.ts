import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";
import { affiliateUrl } from "@/lib/affiliate";

export type ShowItem = {
  id: string;
  artistId: string;
  artistName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl: string;
  source: "ticketmaster" | "songkick" | "bandsintown";
};

// Module-level cache — survives across requests on the same warm instance
let showsCache: { shows: ShowItem[]; builtAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const today = () => new Date().toISOString().split("T")[0];

// ── Ticketmaster ─────────────────────────────────────────────────────────────
async function fetchTicketmaster(
  artist: (typeof ARTISTS)[0],
  apiKey: string,
  now: string
): Promise<ShowItem[]> {
  const params = new URLSearchParams({
    apikey: apiKey,
    keyword: artist.name,
    classificationName: "Music",
    sort: "date,asc",
    size: "10",
    startDateTime: now,
  });
  try {
    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const events: {
      id: string;
      name: string;
      url: string;
      dates: { start: { localDate: string } };
      _embedded?: {
        venues?: { name: string; city?: { name: string }; country?: { name: string } }[];
        attractions?: { name: string; id: string }[];
      };
    }[] = json._embedded?.events ?? [];
    const artistNorm = normalise(artist.name);

    return events
      .filter((e) => {
        // Exact match against the performers list (attractions) — prevents
        // "Drake" matching "Drake White", "Sir Drake", etc.
        const attractions = e._embedded?.attractions ?? [];
        if (attractions.length > 0) {
          return attractions.some((a) => normalise(a.name) === artistNorm);
        }
        // No attractions data — fall back to exact word match in event title
        const eventNorm = normalise(e.name);
        return eventNorm === artistNorm || eventNorm.startsWith(artistNorm + " ") ||
          eventNorm.includes(" " + artistNorm + " ") || eventNorm.endsWith(" " + artistNorm);
      })
      .slice(0, 5)
      .map((e) => ({
        id: `tm-${e.id}`,
        artistId: artist.id,
        artistName: artist.name,
        venue: e._embedded?.venues?.[0]?.name ?? "TBA",
        city: e._embedded?.venues?.[0]?.city?.name ?? "TBA",
        country: e._embedded?.venues?.[0]?.country?.name ?? "",
        date: e.dates.start.localDate,
        ticketUrl: affiliateUrl(e.url),
        source: "ticketmaster" as const,
      }));
  } catch {
    return [];
  }
}

// ── Bandsintown ───────────────────────────────────────────────────────────────
async function fetchBandsintown(
  artist: (typeof ARTISTS)[0],
  appId: string
): Promise<ShowItem[]> {
  try {
    // Verify the artist exists and name matches before fetching events
    const artistRes = await fetch(
      `https://rest.bandsintown.com/artists/${encodeURIComponent(artist.name)}?app_id=${appId}`,
      { next: { revalidate: 86400 } }
    );
    if (!artistRes.ok) return [];
    const artistData = await artistRes.json();
    // Bandsintown may resolve to a different artist — confirm name matches
    if (!artistData?.name || normalise(artistData.name) !== normalise(artist.name)) return [];

    const res = await fetch(
      `https://rest.bandsintown.com/artists/${encodeURIComponent(artist.name)}/events?app_id=${appId}&date=upcoming`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const events = await res.json();
    if (!Array.isArray(events)) return [];
    const cutoff = today();

    return events
      .filter((e) => {
        const date = e.datetime?.split("T")[0];
        return date && date >= cutoff && date !== "0000-00-00";
      })
      .slice(0, 5)
      .map((e) => ({
        id: `bit-${e.id}`,
        artistId: artist.id,
        artistName: artist.name,
        venue: e.venue?.name ?? "TBA",
        city: e.venue?.city ?? "TBA",
        country: e.venue?.country ?? "",
        date: e.datetime.split("T")[0],
        ticketUrl: affiliateUrl((e.offers?.[0]?.url || e.url || "") as string),
        source: "bandsintown" as const,
      }))
      .filter((s) => !!s.ticketUrl);
  } catch {
    return [];
  }
}

// ── Songkick ──────────────────────────────────────────────────────────────────
async function fetchSongkick(
  artist: (typeof ARTISTS)[0],
  apiKey: string
): Promise<ShowItem[]> {
  try {
    const searchRes = await fetch(
      `https://api.songkick.com/api/3.0/search/artists.json?query=${encodeURIComponent(artist.name)}&apikey=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const artists: { id: number; displayName: string }[] =
      searchData.resultsPage?.results?.artist ?? [];
    const artistNorm = normalise(artist.name);
    const match = artists.find((a) => normalise(a.displayName) === artistNorm);
    if (!match) return [];

    const eventsRes = await fetch(
      `https://api.songkick.com/api/3.0/artists/${match.id}/calendar.json?apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!eventsRes.ok) return [];
    const eventsData = await eventsRes.json();
    const events: {
      id: number;
      uri: string;
      start: { date: string };
      venue: { displayName: string; city?: { displayName: string; country?: { displayName: string } } };
    }[] = eventsData.resultsPage?.results?.event ?? [];

    const cutoff = today();
    return events
      .filter((e) => e.start.date && e.start.date >= cutoff)
      .slice(0, 5)
      .map((e) => ({
        id: `sk-${e.id}`,
        artistId: artist.id,
        artistName: artist.name,
        venue: e.venue?.displayName ?? "TBA",
        city: e.venue?.city?.displayName ?? "TBA",
        country: e.venue?.city?.country?.displayName ?? "",
        date: e.start.date,
        ticketUrl: affiliateUrl(e.uri),
        source: "songkick" as const,
      }));
  } catch {
    return [];
  }
}

// ── Build full shows dataset ──────────────────────────────────────────────────
async function buildShows(
  artists: typeof ARTISTS,
  tmKey: string | undefined,
  skKey: string | undefined,
  bitId: string | undefined
): Promise<ShowItem[]> {
  const now = new Date().toISOString().split(".")[0] + "Z";
  const allShows: ShowItem[] = [];

  // Process in batches of 20 — parallel within each batch, sequential between
  const BATCH = 20;
  for (let i = 0; i < artists.length; i += BATCH) {
    const batch = artists.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (artist) => {
        const [tmShows, skShows, bitShows] = await Promise.all([
          tmKey ? fetchTicketmaster(artist, tmKey, now) : Promise.resolve([]),
          skKey ? fetchSongkick(artist, skKey) : Promise.resolve([]),
          bitId ? fetchBandsintown(artist, bitId) : Promise.resolve([]),
        ]);

        // Merge + deduplicate (Bandsintown first as it often has richer data)
        const seen = new Set<string>();
        const merged: ShowItem[] = [];
        for (const show of [...bitShows, ...tmShows, ...skShows]) {
          const key = `${show.artistId}|${show.date}|${normalise(show.venue).slice(0, 10)}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(show);
          }
        }
        return merged.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") allShows.push(...r.value);
    }
  }

  return allShows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ── Main route ────────────────────────────────────────────────────────────────
// Tell Next.js to cache this route for 1 hour at the CDN/platform level,
// so cold-start serverless instances don't all hammer Ticketmaster at once.
export const revalidate = 3600;

export async function GET() {
  // Serve from memory cache if fresh — filter out past shows before responding
  if (showsCache && Date.now() - showsCache.builtAt < CACHE_TTL) {
    const cutoff = today();
    const freshShows = showsCache.shows.filter((s) => s.date >= cutoff);
    return NextResponse.json({ shows: freshShows }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  }

  const tmKey = process.env.TICKETMASTER_API_KEY;
  const skKey = process.env.SONGKICK_API_KEY || undefined;
  // Register at https://bandsintown.com/api_key_requests to get a production key
  // "test" works for development only
  const bitId = process.env.BANDSINTOWN_APP_ID || "test";

  if (!tmKey && !skKey && !bitId) {
    return NextResponse.json({ shows: [] });
  }

  // Sort all artists: voted ones first, then alphabetical
  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("artist_id, vote_count")
    .order("vote_count", { ascending: false });

  const artistVotes: Record<string, number> = {};
  for (const row of data ?? []) {
    artistVotes[row.artist_id] = (artistVotes[row.artist_id] ?? 0) + Number(row.vote_count);
  }

  // Query all artists, voted ones sorted to the front
  const sortedArtists = [...ARTISTS].sort(
    (a, b) => (artistVotes[b.id] ?? 0) - (artistVotes[a.id] ?? 0)
  );

  const shows = await buildShows(sortedArtists, tmKey, skKey, bitId);
  showsCache = { shows, builtAt: Date.now() };

  return NextResponse.json({ shows }, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
