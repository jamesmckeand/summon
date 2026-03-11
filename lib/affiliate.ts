/**
 * Affiliate link wrapper.
 *
 * Ticketmaster: CJ Affiliate (Commission Junction) — apply at ticketmaster.com/affiliates
 *   Once approved, copy your CJ tracking base URL and set TICKETMASTER_AFFILIATE_URL in Vercel.
 *   Format: https://www.tkqlhce.com/click-{pubId}-{advId} — we append ?url={encodedDestination}.
 *
 * StubHub: Rakuten Advertising — apply at rakutenadvertising.com
 *   Once approved, set STUBHUB_AFFILIATE_URL in Vercel (same ?url= deep-link pattern).
 *
 * SeatGeek: direct — apply at seatgeek.com/partners
 *   Once approved, set SEATGEEK_AFFILIATE_ID in Vercel.
 *
 * Songkick / Viagogo / Eventbrite: Awin — apply at awin.com/us/publishers
 *   Set SONGKICK_AFFILIATE_ID / VIAGOGO_AWIN_ID / EVENTBRITE_AWIN_ID in Vercel.
 */

export function affiliateUrl(url: string): string {
  if (!url) return url;

  try {
    const { hostname } = new URL(url);

    if (hostname.includes("ticketmaster.com") || hostname.includes("livenation.com")) {
      const base = process.env.TICKETMASTER_AFFILIATE_URL;
      if (base) return `${base}?url=${encodeURIComponent(url)}`;
    }

    if (hostname.includes("songkick.com")) {
      const id = process.env.SONGKICK_AFFILIATE_ID;
      if (id) return `https://www.awin1.com/cread.php?awinmid=6925&awinaffid=${id}&ued=${encodeURIComponent(url)}`;
    }

    // StubHub — Rakuten Advertising (rakutenadvertising.com)
    // Set STUBHUB_AFFILIATE_URL in Vercel when ready
    if (hostname.includes("stubhub.com")) {
      const base = process.env.STUBHUB_AFFILIATE_URL;
      if (base) return `${base}?url=${encodeURIComponent(url)}`;
    }

    // SeatGeek — direct partner program (seatgeek.com/partners)
    // Set SEATGEEK_AFFILIATE_ID in Vercel when ready
    if (hostname.includes("seatgeek.com")) {
      const id = process.env.SEATGEEK_AFFILIATE_ID;
      if (id) return `${url}${url.includes("?") ? "&" : "?"}aid=${id}`;
    }

    // Viagogo — Awin (awin.com, search "Viagogo")
    // Set VIAGOGO_AWIN_ID in Vercel when ready
    if (hostname.includes("viagogo.com")) {
      const id = process.env.VIAGOGO_AWIN_ID;
      if (id) return `https://www.awin1.com/cread.php?awinmid=6138&awinaffid=${id}&ued=${encodeURIComponent(url)}`;
    }

    // Eventbrite — Awin (awin.com, search "Eventbrite")
    // Set EVENTBRITE_AWIN_ID in Vercel when ready
    if (hostname.includes("eventbrite.com")) {
      const id = process.env.EVENTBRITE_AWIN_ID;
      if (id) return `https://www.awin1.com/cread.php?awinmid=6724&awinaffid=${id}&ued=${encodeURIComponent(url)}`;
    }
  } catch {
    // not a valid URL — return as-is
  }

  return url;
}
