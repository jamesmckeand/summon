import { NextResponse } from "next/server";
import { affiliateUrl } from "@/lib/affiliate";

// City name → Ticketmaster stateCode / countryCode lookup
// Lets us narrow searches so "Portland" doesn't match Portland, UK etc.
const CITY_META: Record<string, { countryCode: string; stateCode?: string }> = {
  // US states
  "New York":         { countryCode: "US", stateCode: "NY" },
  "Boston":           { countryCode: "US", stateCode: "MA" },
  "Philadelphia":     { countryCode: "US", stateCode: "PA" },
  "Washington DC":    { countryCode: "US", stateCode: "DC" },
  "Baltimore":        { countryCode: "US", stateCode: "MD" },
  "Pittsburgh":       { countryCode: "US", stateCode: "PA" },
  "Buffalo":          { countryCode: "US", stateCode: "NY" },
  "Hartford":         { countryCode: "US", stateCode: "CT" },
  "Providence":       { countryCode: "US", stateCode: "RI" },
  "Newark":           { countryCode: "US", stateCode: "NJ" },
  "Atlanta":          { countryCode: "US", stateCode: "GA" },
  "Miami":            { countryCode: "US", stateCode: "FL" },
  "Orlando":          { countryCode: "US", stateCode: "FL" },
  "Tampa":            { countryCode: "US", stateCode: "FL" },
  "Charlotte":        { countryCode: "US", stateCode: "NC" },
  "Nashville":        { countryCode: "US", stateCode: "TN" },
  "New Orleans":      { countryCode: "US", stateCode: "LA" },
  "Memphis":          { countryCode: "US", stateCode: "TN" },
  "Richmond":         { countryCode: "US", stateCode: "VA" },
  "Raleigh":          { countryCode: "US", stateCode: "NC" },
  "Jacksonville":     { countryCode: "US", stateCode: "FL" },
  "Louisville":       { countryCode: "US", stateCode: "KY" },
  "Birmingham":       { countryCode: "US", stateCode: "AL" },
  "Columbia":         { countryCode: "US", stateCode: "SC" },
  "Savannah":         { countryCode: "US", stateCode: "GA" },
  "Chicago":          { countryCode: "US", stateCode: "IL" },
  "Detroit":          { countryCode: "US", stateCode: "MI" },
  "Minneapolis":      { countryCode: "US", stateCode: "MN" },
  "Cleveland":        { countryCode: "US", stateCode: "OH" },
  "Cincinnati":       { countryCode: "US", stateCode: "OH" },
  "Indianapolis":     { countryCode: "US", stateCode: "IN" },
  "Columbus":         { countryCode: "US", stateCode: "OH" },
  "Milwaukee":        { countryCode: "US", stateCode: "WI" },
  "Kansas City":      { countryCode: "US", stateCode: "MO" },
  "St. Louis":        { countryCode: "US", stateCode: "MO" },
  "Omaha":            { countryCode: "US", stateCode: "NE" },
  "Des Moines":       { countryCode: "US", stateCode: "IA" },
  "Madison":          { countryCode: "US", stateCode: "WI" },
  "Dallas":           { countryCode: "US", stateCode: "TX" },
  "Houston":          { countryCode: "US", stateCode: "TX" },
  "Austin":           { countryCode: "US", stateCode: "TX" },
  "San Antonio":      { countryCode: "US", stateCode: "TX" },
  "Phoenix":          { countryCode: "US", stateCode: "AZ" },
  "Albuquerque":      { countryCode: "US", stateCode: "NM" },
  "Tucson":           { countryCode: "US", stateCode: "AZ" },
  "Las Vegas":        { countryCode: "US", stateCode: "NV" },
  "El Paso":          { countryCode: "US", stateCode: "TX" },
  "Oklahoma City":    { countryCode: "US", stateCode: "OK" },
  "Denver":           { countryCode: "US", stateCode: "CO" },
  "Colorado Springs": { countryCode: "US", stateCode: "CO" },
  "Salt Lake City":   { countryCode: "US", stateCode: "UT" },
  "Los Angeles":      { countryCode: "US", stateCode: "CA" },
  "San Francisco":    { countryCode: "US", stateCode: "CA" },
  "Seattle":          { countryCode: "US", stateCode: "WA" },
  "Portland":         { countryCode: "US", stateCode: "OR" },
  "San Diego":        { countryCode: "US", stateCode: "CA" },
  "Sacramento":       { countryCode: "US", stateCode: "CA" },
  "San Jose":         { countryCode: "US", stateCode: "CA" },
  "Oakland":          { countryCode: "US", stateCode: "CA" },
  "Anaheim":          { countryCode: "US", stateCode: "CA" },
  "Fresno":           { countryCode: "US", stateCode: "CA" },
  "Long Beach":       { countryCode: "US", stateCode: "CA" },
  "Bakersfield":      { countryCode: "US", stateCode: "CA" },
  "Honolulu":         { countryCode: "US", stateCode: "HI" },
  "Anchorage":        { countryCode: "US", stateCode: "AK" },
  // Canada
  "Toronto":          { countryCode: "CA" },
  "Montreal":         { countryCode: "CA" },
  "Vancouver":        { countryCode: "CA" },
  "Calgary":          { countryCode: "CA" },
  "Edmonton":         { countryCode: "CA" },
  "Ottawa":           { countryCode: "CA" },
  "Winnipeg":         { countryCode: "CA" },
  "Quebec City":      { countryCode: "CA" },
  "Hamilton":         { countryCode: "CA" },
  "Halifax":          { countryCode: "CA" },
  "Victoria":         { countryCode: "CA" },
  "Saskatoon":        { countryCode: "CA" },
  "Regina":           { countryCode: "CA" },
  "Kelowna":          { countryCode: "CA" },
  "Windsor":          { countryCode: "CA" },
  "London, ON":       { countryCode: "CA" },
  "Kitchener":        { countryCode: "CA" },
  "Barrie":           { countryCode: "CA" },
};

export type Show = {
  id: string;
  venue: string;
  city: string;
  date: string;       // ISO date string
  ticketUrl: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistName = searchParams.get("artistName");
  const city = searchParams.get("city");

  if (!artistName || !city) {
    return NextResponse.json({ shows: [] });
  }

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ shows: [] });
  }

  const meta = CITY_META[city];
  const cityParam = city === "London, ON" ? "London" : city;

  const params = new URLSearchParams({
    apikey: apiKey,
    keyword: artistName,
    city: cityParam,
    classificationName: "Music",
    sort: "date,asc",
    size: "5",
    // Only future events
    startDateTime: new Date().toISOString().split(".")[0] + "Z",
  });

  if (meta?.countryCode) params.set("countryCode", meta.countryCode);
  if (meta?.stateCode) params.set("stateCode", meta.stateCode);

  try {
    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
      { next: { revalidate: 3600 } } // 1-hour cache
    );

    if (!res.ok) return NextResponse.json({ shows: [] });

    const data = await res.json();
    const events = data._embedded?.events ?? [];

    // Filter: artist name must appear in event name (avoid false matches)
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const artistNorm = normalise(artistName);

    const shows: Show[] = events
      .filter((e: { name: string }) => normalise(e.name).includes(artistNorm))
      .map((e: {
        id: string;
        name: string;
        url: string;
        dates: { start: { localDate: string } };
        _embedded?: { venues?: { name: string }[] };
      }) => ({
        id: e.id,
        venue: e._embedded?.venues?.[0]?.name ?? "TBA",
        city,
        date: e.dates.start.localDate,
        ticketUrl: affiliateUrl(e.url ?? ""),
      }))
      .filter((s: Show) => !!s.ticketUrl);

    return NextResponse.json({ shows }, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ shows: [] });
  }
}
