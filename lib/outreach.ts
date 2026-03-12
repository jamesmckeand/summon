import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wesummon.com";

// When an artist hits a threshold, look up their booking contact and queue outreach
export async function queueArtistContactOutreach(
  artistId: string,
  artistName: string,
  city: string,
  voteCount: number,
  tier: string,
  tierLabel: string,
) {
  const admin = createAdminClient();

  // Look up artist contact info
  const { data: contact } = await admin
    .from("artist_contacts")
    .select("manager_name, manager_email, booking_agent_name, booking_agent_email, agency")
    .eq("artist_id", artistId)
    .eq("active", true)
    .single();

  // If no contact found yet, trigger async lookup (fire-and-forget)
  if (!contact) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wesummon.com";
    fetch(`${siteUrl}/api/admin/lookup-artist-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET ?? "",
      },
      body: JSON.stringify({ artistId, artistName }),
    }).catch(() => {});
  }

  // Add to log (deduped by artist/city/threshold unique index)
  const { error } = await admin
    .from("artist_contact_log")
    .insert({
      artist_id:           artistId,
      artist_name:         artistName,
      city,
      threshold:           voteCount,
      tier,
      vote_count:          voteCount,
      manager_name:        contact?.manager_name ?? null,
      manager_email:       contact?.manager_email ?? null,
      booking_agent_name:  contact?.booking_agent_name ?? null,
      booking_agent_email: contact?.booking_agent_email ?? null,
      agency:              contact?.agency ?? null,
      status:              "new",
    });

  // Duplicate — already logged, skip
  if (error?.code === "23505") return;

  // Send internal alert so you know a contact is queued
  const demandUrl = `${BASE}/live/${artistId}/${city.toLowerCase().replace(/\s+/g, "-")}`;
  const hasContact = contact?.booking_agent_email || contact?.manager_email;

  await resend.emails.send({
    from: "Summon <hello@wesummon.com>",
    to: "hello@wesummon.com",
    subject: `🎤 Artist contact queued: ${artistName} hit ${voteCount.toLocaleString()} votes in ${city}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 4px;font-size:20px;color:#fff">Artist contact queued</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:14px">${artistName} just hit the <strong style="color:#fff">${tierLabel}</strong> threshold in ${city}.</p>

        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.05em">Artist · City · Votes</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#fff">${artistName}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#a78bfa">${city} · ${voteCount.toLocaleString()} votes (${tierLabel})</p>
        </div>

        ${hasContact ? `
        <div style="background:#0d1a0d;border:1px solid #1a4a1a;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 10px;font-size:12px;color:#4ade80;text-transform:uppercase;letter-spacing:.05em">Contact found</p>
          ${contact?.booking_agent_name ? `<p style="margin:0 0 4px;font-size:14px;color:#d4d4d4"><strong>Booking Agent:</strong> ${contact.booking_agent_name}${contact?.agency ? ` (${contact.agency})` : ""}</p>` : ""}
          ${contact?.booking_agent_email ? `<p style="margin:0 0 8px;font-size:14px;color:#a78bfa"><a href="mailto:${contact.booking_agent_email}" style="color:#a78bfa">${contact.booking_agent_email}</a></p>` : ""}
          ${contact?.manager_name ? `<p style="margin:0 0 4px;font-size:14px;color:#d4d4d4"><strong>Manager:</strong> ${contact.manager_name}</p>` : ""}
          ${contact?.manager_email ? `<p style="margin:0;font-size:14px;color:#a78bfa"><a href="mailto:${contact.manager_email}" style="color:#a78bfa">${contact.manager_email}</a></p>` : ""}
        </div>
        ` : `
        <div style="background:#1a0d0d;border:1px solid #4a1a1a;border-radius:8px;padding:14px;margin-bottom:20px">
          <p style="margin:0;font-size:13px;color:#f87171">No contact found for ${artistName} yet. Add one in the Supabase artist_contacts table.</p>
        </div>
        `}

        <a href="${demandUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          View demand data →
        </a>

        <p style="color:#444;font-size:11px;margin-top:24px">Summon internal alert · <a href="https://wesummon.com" style="color:#444">wesummon.com</a></p>
      </div>
    `,
  });
}

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
