import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ARTISTS } from "@/lib/data/artists";

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

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey || topArtists.length === 0) {
    return NextResponse.json({ shows: [] });
  }

  const now = new Date().toISOString().split(".")[0] + "Z";
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const results = await Promise.allSettled(
    topArtists.map(async (artist) => {
      const params = new URLSearchParams({
        apikey: apiKey,
        keyword: artist.name,
        classificationName: "Music",
        sort: "date,asc",
        size: "5",
        startDateTime: now,
      });

      const res = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
        { next: { revalidate: 3600 } }
      );

      if (!res.ok) return [];

      const json = await res.json();
      const events = json._embedded?.events ?? [];
      const artistNorm = normalise(artist.name);

      return events
        .filter((e: { name: string }) => normalise(e.name).includes(artistNorm))
        .slice(0, 3)
        .map((e: {
          id: string;
          url: string;
          dates: { start: { localDate: string } };
          _embedded?: { venues?: { name: string; city?: { name: string }; country?: { name: string } }[] };
        }) => ({
          id: e.id,
          artistId: artist.id,
          artistName: artist.name,
          venue: e._embedded?.venues?.[0]?.name ?? "TBA",
          city: e._embedded?.venues?.[0]?.city?.name ?? "TBA",
          country: e._embedded?.venues?.[0]?.country?.name ?? "",
          date: e.dates.start.localDate,
          ticketUrl: e.url,
        }));
    })
  );

  const shows = results
    .filter((r): r is PromiseFulfilledResult<object[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a: { date: string }, b: { date: string }) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  return NextResponse.json({ shows }, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
