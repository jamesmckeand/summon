import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wesummon.com";

// Maps threshold tier names to promoters.venue_type values
const TIER_TO_VENUE_TYPE: Record<string, string[]> = {
  bar:         ["bar", "club"],
  theatre:     ["theatre"],
  concertHall: ["concert_hall"],
  arena:       ["arena"],
};

export async function sendAutomatedOutreach(
  artistId: string,
  artistName: string,
  city: string,
  voteCount: number,
  tier: string,
  tierLabel: string,
) {
  const admin = createAdminClient();
  const venueTypes = TIER_TO_VENUE_TYPE[tier] ?? ["bar", "club"];

  // Get promoters for this city + tier who have a booking email
  const { data: promoters } = await admin
    .from("promoters")
    .select("id, venue_name, booking_email, talent_buyer, promoter_company")
    .eq("city", city)
    .eq("active", true)
    .in("venue_type", venueTypes)
    .not("booking_email", "is", null);

  if (!promoters?.length) return;

  // Find promoters already contacted for this exact artist/city/threshold
  const { data: alreadySent } = await admin
    .from("outreach_log")
    .select("promoter_id")
    .eq("artist_id", artistId)
    .eq("city", city)
    .eq("threshold", voteCount);

  const alreadySentIds = new Set((alreadySent ?? []).map((r) => r.promoter_id));
  const targets = promoters.filter((p) => !alreadySentIds.has(p.id));

  if (!targets.length) return;

  const demandUrl = `${BASE}/live/${artistId}/${city.toLowerCase().replace(/\s+/g, "-")}`;

  await Promise.allSettled(
    targets.map(async (promoter) => {
      const greeting = promoter.talent_buyer
        ? `Hi ${promoter.talent_buyer.split(" ")[0]},`
        : "Hi there,";

      await resend.emails.send({
        from: "James at Summon <hello@wesummon.com>",
        to: promoter.booking_email!,
        subject: `${voteCount.toLocaleString()} fans want ${artistName} at ${promoter.venue_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.6">
            <p style="margin:0 0 16px">${greeting}</p>

            <p style="margin:0 0 16px">
              My name is James — I run <a href="${BASE}" style="color:#7c3aed">Summon</a>, a fan demand platform for live music.
              Fans vote for artists they want to see in their city, and when votes hit milestones, we reach out to venues and promoters.
            </p>

            <p style="margin:0 0 16px">
              <strong>${voteCount.toLocaleString()} fans in ${city}</strong> have voted for <strong>${artistName}</strong>
              to perform — and based on that demand, <strong>${promoter.venue_name}</strong> is a strong fit.
            </p>

            <div style="background:#f5f3ff;border-left:3px solid #7c3aed;padding:14px 16px;margin:20px 0;border-radius:0 6px 6px 0">
              <p style="margin:0;font-size:14px;color:#444">
                <strong>${voteCount.toLocaleString()} votes</strong> in ${city} for ${artistName} (${tierLabel} tier)
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#666">
                <a href="${demandUrl}" style="color:#7c3aed">View live demand data →</a>
              </p>
            </div>

            <p style="margin:0 0 16px">
              Would you be open to a quick conversation about booking ${artistName} at ${promoter.venue_name}?
              Happy to share more demand data or connect you directly with the artist's team.
            </p>

            <p style="margin:0 0 8px">Best,</p>
            <p style="margin:0"><strong>James McKeand</strong><br>
            Founder, Summon<br>
            <a href="mailto:hello@wesummon.com" style="color:#7c3aed">hello@wesummon.com</a> · <a href="${BASE}" style="color:#7c3aed">wesummon.com</a>
            </p>

            <p style="margin:28px 0 0;font-size:11px;color:#999">
              You're receiving this because ${voteCount.toLocaleString()} fans voted for ${artistName} in ${city} on Summon.
              To opt out of future outreach, reply with "unsubscribe".
            </p>
          </div>
        `,
      });

      // Log the send
      await admin.from("outreach_log").insert({
        artist_id:   artistId,
        artist_name: artistName,
        city,
        threshold:   voteCount,
        promoter_id: promoter.id,
        venue_name:  promoter.venue_name,
        status:      "sent",
      });
    })
  );
}
