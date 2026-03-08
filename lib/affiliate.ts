/**
 * Affiliate link wrapper.
 *
 * Ticketmaster: via Impact (impact.com) → find Ticketmaster program, create a deep link.
 *   Copy the base tracking URL (e.g. https://ticketmaster.sjv.io/c/{campaignId}/{pubId})
 *   and set TICKETMASTER_IMPACT_URL="https://ticketmaster.sjv.io/c/..." in Vercel env.
 *   We append ?url={encodedDestination} for deep linking.
 *
 * Songkick: sign up at https://www.awin.com → search "Songkick"
 *   Once approved, set SONGKICK_AFFILIATE_ID="awinAffiliateId" in env
 */

export function affiliateUrl(url: string): string {
  if (!url) return url;

  try {
    const { hostname } = new URL(url);

    if (hostname.includes("ticketmaster.com") || hostname.includes("livenation.com")) {
      const base = process.env.TICKETMASTER_IMPACT_URL;
      if (base) return `${base}?url=${encodeURIComponent(url)}`;
    }

    if (hostname.includes("songkick.com")) {
      const id = process.env.SONGKICK_AFFILIATE_ID;
      if (id) return `https://www.awin1.com/cread.php?awinmid=6925&awinaffid=${id}&ued=${encodeURIComponent(url)}`;
    }
  } catch {
    // not a valid URL — return as-is
  }

  return url;
}
