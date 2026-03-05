/**
 * Affiliate link wrapper.
 *
 * Ticketmaster: sign up at https://www.cj.com → search "Ticketmaster"
 *   Once approved, set TICKETMASTER_AFFILIATE_ID="publisherId-websiteId" in env
 *
 * Songkick: sign up at https://www.awin.com → search "Songkick"
 *   Once approved, set SONGKICK_AFFILIATE_ID="awinAffiliateId" in env
 */

export function affiliateUrl(url: string): string {
  if (!url) return url;

  try {
    const { hostname } = new URL(url);

    if (hostname.includes("ticketmaster.com") || hostname.includes("livenation.com")) {
      const id = process.env.TICKETMASTER_AFFILIATE_ID;
      if (id) return `https://www.tkqlhce.com/click-${id}?url=${encodeURIComponent(url)}`;
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
