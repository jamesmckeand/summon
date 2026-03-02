import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

type ShowItem = {
  id: string;
  artistId: string;
  artistName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl: string;
  source: "ticketmaster" | "songkick";
};

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// ── Ticketmaster ────────────────────────────────────────────────────────────
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
    size: "5",
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
      _embedded?: { venues?: { name: string; city?: { name: string }; country?: { name: string } }[] };
    }[] = json._embedded?.events ?? [];
    const artistNorm = normalise(artist.name);

    return events
      .filter((e) => normalise(e.name).includes(artistNorm))
      .slice(0, 3)
      .map((e) => ({
        id: `tm-${e.id}`,
        artistId: artist.id,
        artistName: artist.name,
        venue: e._embedded?.venues?.[0]?.name ?? "TBA",
        city: e._embedded?.venues?.[0]?.city?.name ?? "TBA",
        country: e._embedded?.venues?.[0]?.country?.name ?? "",
        date: e.dates.start.localDate,
        ticketUrl: e.url,
        source: "ticketmaster" as const,
      }));
  } catch {
    return [];
  }
}

// ── Songkick ────────────────────────────────────────────────────────────────
async function fetchSongkick(
  artist: (typeof ARTISTS)[0],
  apiKey: string
): Promise<ShowItem[]> {
  try {
    // Step 1: find the Songkick artist ID
    const searchRes = await fetch(
      `https://api.songkick.com/api/3.0/search/artists.json?query=${encodeURIComponent(artist.name)}&apikey=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const artists: { id: number; displayName: string }[] =
      searchData.resultsPage?.results?.artist ?? [];

    // Match by normalised name
    const artistNorm = normalise(artist.name);
    const match = artists.find((a) => normalise(a.displayName) === artistNorm);
    if (!match) return [];

    // Step 2: fetch upcoming events
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

    return events.slice(0, 3).map((e) => ({
      id: `sk-${e.id}`,
      artistId: artist.id,
      artistName: artist.name,
      venue: e.venue?.displayName ?? "TBA",
      city: e.venue?.city?.displayName ?? "TBA",
      country: e.venue?.city?.country?.displayName ?? "",
      date: e.start.date,
      ticketUrl: e.uri,
      source: "songkick" as const,
    }));
  } catch {
    return [];
  }
}

// ── Main route ───────────────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vote_counts")
    .select("artist_id, vote_count")
    .order("vote_count", { ascending: false });

  // Sum votes per artist, take top 15
  const artistVotes: Record<string, number> = {};
  for (const row of data ?? []) {
    artistVotes[row.artist_id] = (artistVotes[row.artist_id] ?? 0) + Number(row.vote_count);
  }

  const topArtists = Object.entries(artistVotes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id]) => ARTISTS.find((a) => a.id === id))
    .filter(Boolean) as typeof ARTISTS;

  const tmKey = process.env.TICKETMASTER_API_KEY;
  const skKey = process.env.SONGKICK_API_KEY;

  if ((!tmKey && !skKey) || topArtists.length === 0) {
    return NextResponse.json({ shows: [] });
  }

  const now = new Date().toISOString().split(".")[0] + "Z";

  // Fetch from both sources in parallel per artist
  const results = await Promise.allSettled(
    topArtists.map(async (artist) => {
      const [tmShows, skShows] = await Promise.all([
        tmKey ? fetchTicketmaster(artist, tmKey, now) : Promise.resolve([]),
        skKey ? fetchSongkick(artist, skKey) : Promise.resolve([]),
      ]);

      // Merge and deduplicate by date (same artist + same date = same show)
      const seen = new Set<string>();
      const merged: ShowItem[] = [];
      for (const show of [...tmShows, ...skShows]) {
        const key = `${show.artistId}|${show.date}|${normalise(show.venue).slice(0, 10)}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(show);
        }
      }
      return merged.sort((a, b) => a.date.localeCompare(b.date));
    })
  );

  const shows = results
    .filter((r): r is PromiseFulfilledResult<ShowItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({ shows }, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
