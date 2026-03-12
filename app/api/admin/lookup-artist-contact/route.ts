import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Internal endpoint — requires CRON_SECRET header
// Called async (fire-and-forget) when an artist crosses 50-votes-away or a threshold.
// Uses free public APIs (Wikipedia + DuckDuckGo) — no API key required.

function cleanWikiMarkup(s: string): string {
  return s
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1") // [[Link|Text]] → Text
    .replace(/\{\{[^}]*\}\}/g, "")                     // remove {{templates}}
    .replace(/<[^>]+>/g, "")                            // strip HTML tags
    .replace(/'{2,}/g, "")                              // remove bold/italic ''
    .replace(/\s+/g, " ")
    .trim();
}

async function lookupWikipedia(artistName: string) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(artistName)}&prop=revisions&rvprop=content&rvslots=main&format=json&origin=*`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as Record<string, unknown>;
    if ((page as { missing?: string }).missing !== undefined) return null;
    const revisions = page?.revisions as Array<Record<string, unknown>> | undefined;
    const slot = ((revisions?.[0]?.slots as Record<string, unknown>)?.main) as Record<string, unknown> | undefined;
    const wikitext: string = (slot?.["*"] as string) ?? "";
    if (!wikitext) return null;

    const extract = (pattern: RegExp) => {
      const m = wikitext.match(pattern);
      return m ? cleanWikiMarkup(m[1]) || null : null;
    };

    const agency       = extract(/\|\s*booking_agent\s*=([^\n|{}]+)/i)
                      ?? extract(/\|\s*agency\s*=([^\n|{}]+)/i);
    const managerName  = extract(/\|\s*management\s*=([^\n|{}]+)/i)
                      ?? extract(/\|\s*manager\s*=([^\n|{}]+)/i);

    return { agency, manager_name: managerName };
  } catch {
    return null;
  }
}

async function lookupDuckDuckGo(artistName: string) {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(artistName)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();

    // Social profiles sometimes contain Facebook
    const profiles: Array<{ URL?: string }> = data?.Results ?? [];
    const fbUrl = profiles.find((r) => r.URL?.includes("facebook.com"))?.URL ?? null;

    // Abstract text may mention booking agency
    const abstract: string = data?.AbstractText ?? "";
    let agency: string | null = null;

    const agencyMatch = abstract.match(
      /(?:represented by|signed to|booked by|booking agency[:\s]+|managed by)\s+([\w\s&]+(?:Agency|Artists|Entertainment|Music|Talent|Management|CAA|WME|UTA|Paradigm|Wasserman|ICM|Arrival)[^.,)]*)/i
    );
    if (agencyMatch) agency = agencyMatch[1].trim();

    return { facebook_url: fbUrl, agency };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { artistId, artistName } = await request.json();
  if (!artistId || !artistName) {
    return NextResponse.json({ error: "Missing artistId or artistName" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Skip if we already have useful contact info
  const { data: existing } = await admin
    .from("artist_contacts")
    .select("id, booking_agent_email, manager_email, agency, facebook_url")
    .eq("artist_id", artistId)
    .single();

  if (
    existing?.booking_agent_email ||
    existing?.manager_email ||
    (existing?.agency && existing?.facebook_url)
  ) {
    return NextResponse.json({ ok: true, skipped: "already_has_contact" });
  }

  // Run both lookups in parallel
  const [wiki, ddg] = await Promise.all([
    lookupWikipedia(artistName),
    lookupDuckDuckGo(artistName),
  ]);

  const contactData = {
    agency:       wiki?.agency ?? ddg?.agency ?? null,
    manager_name: wiki?.manager_name ?? null,
    facebook_url: ddg?.facebook_url ?? null,
    // Emails are rarely public — left null; user fills via admin
    booking_agent_name:  null as string | null,
    booking_agent_email: null as string | null,
    manager_email:       null as string | null,
    source: "wikipedia+duckduckgo",
  };

  // Upsert result (even if empty — prevents repeat lookups)
  await admin
    .from("artist_contacts")
    .upsert(
      {
        artist_id:           artistId,
        artist_name:         artistName,
        ...contactData,
        updated_at:          new Date().toISOString(),
      },
      { onConflict: "artist_id" }
    );

  // Backfill any contact_log rows that still have no agency info
  const foundSomething = contactData.agency || contactData.manager_name;
  if (foundSomething) {
    await admin
      .from("artist_contact_log")
      .update({
        agency:       contactData.agency,
        manager_name: contactData.manager_name,
        updated_at:   new Date().toISOString(),
      })
      .eq("artist_id", artistId)
      .is("agency", null);
  }

  return NextResponse.json({ ok: true, contact: contactData });
}
