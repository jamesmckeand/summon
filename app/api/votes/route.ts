import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Resend } from "resend";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { sendPush } from "@/lib/apns";
import { sendAutomatedOutreach, queueArtistContactOutreach } from "@/lib/outreach";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_ARTIST_IDS = new Set(ARTISTS.map((a) => a.id));
const VALID_CITIES = new Set(CITIES);

const THRESHOLDS = [
  { votes: 500,   tier: "bar" as const,         label: "Bar / Club" },
  { votes: 2500,  tier: "theatre" as const,     label: "Theatre" },
  { votes: 7500,  tier: "concertHall" as const, label: "Concert Hall" },
  { votes: 25000, tier: "arena" as const,       label: "Arena" },
];

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendOutreachAlert(
  artistName: string,
  city: string,
  voteCount: number,
  tier: typeof THRESHOLDS[number]["tier"],
  tierLabel: string,
) {
  const venues = getVenuesForCity(city);
  const venueName = venues[tier]?.[0] ?? tierLabel;
  const allVenuesForTier = venues[tier] ?? [];
  const artistObj = ARTISTS.find((a) => a.name === artistName);
  const artistUrl = `https://wesummon.com${artistObj ? `/artist/${artistObj.id}` : "/explore"}`; // live artists fall back to /explore
  const nextThreshold = THRESHOLDS.find((t) => t.votes > voteCount);

  // Escaped versions for HTML templates
  const eArtist = escapeHtml(artistName);
  const eCity = escapeHtml(city);
  const eVenue = escapeHtml(venueName);
  const eTierLabel = escapeHtml(tierLabel);

  const draftOutreach = `Subject: ${voteCount.toLocaleString()} fans want ${artistName} at ${venueName}

Hi,

I'm reaching out on behalf of ${voteCount.toLocaleString()} fans in ${city} who have voted on Summon (wesummon.com) to see ${artistName} perform live.

Based on demand, ${venueName} is the best-fit venue for this show. Would you be open to a conversation about booking ${artistName} for an event in ${city}?

You can view live fan demand here: ${artistUrl}

Best,
Summon Team
hello@wesummon.com`;

  await getResend().emails.send({
    from: "Summon <hello@wesummon.com>",
    to: "hello@wesummon.com",
    subject: `🚨 Outreach needed: ${artistName} hit ${voteCount.toLocaleString()} votes in ${city}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 4px;font-size:22px;color:#fff">Threshold crossed — action needed</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:14px">A new vote milestone just triggered. Time to reach out.</p>

        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.05em">Artist</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#fff">${eArtist}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          <div style="background:#1a1a1a;border-radius:8px;padding:14px">
            <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.05em">City</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#fff">${eCity}</p>
          </div>
          <div style="background:#1a1a1a;border-radius:8px;padding:14px">
            <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.05em">Votes</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#a78bfa">${voteCount.toLocaleString()}</p>
          </div>
          <div style="background:#1a1a1a;border-radius:8px;padding:14px">
            <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.05em">Tier</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#fff">${eTierLabel}</p>
          </div>
          <div style="background:#1a1a1a;border-radius:8px;padding:14px">
            <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.05em">Target venue</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#ec4899">${eVenue}</p>
          </div>
        </div>

        ${allVenuesForTier.length > 1 ? `
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:14px;margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:12px;color:#888">Other ${eTierLabel} venues to try in ${eCity}:</p>
          <p style="margin:0;font-size:14px;color:#d4d4d4">${allVenuesForTier.slice(1).map(escapeHtml).join(", ")}</p>
        </div>
        ` : ""}

        ${nextThreshold ? `
        <div style="background:#111;border:1px solid #333;border-radius:8px;padding:14px;margin-bottom:20px">
          <p style="margin:0;font-size:12px;color:#888">Next milestone: <strong style="color:#fff">${nextThreshold.votes.toLocaleString()} votes → ${escapeHtml(nextThreshold.label)}</strong></p>
        </div>
        ` : ""}

        <div style="background:#0d0d1a;border:1px solid #2a2a4a;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0 0 10px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.05em">Draft outreach email</p>
          <pre style="margin:0;font-size:13px;color:#d4d4d4;white-space:pre-wrap;font-family:monospace;line-height:1.6">${draftOutreach.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </div>

        <a href="${artistUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          View live demand →
        </a>

        <p style="color:#444;font-size:11px;margin-top:24px">Summon internal alert · <a href="https://wesummon.com" style="color:#444">wesummon.com</a></p>
      </div>
    `,
  });
}

async function sendWarningEmail(
  email: string,
  artistName: string,
  city: string,
  voteCount: number,
  votesNeeded: number,
  tierLabel: string,
) {
  const artistPath = ARTISTS.find((a) => a.name === artistName)?.id;
  const artistUrl = `https://wesummon.com${artistPath ? `/artist/${artistPath}` : "/explore"}`;
  const eArtist = escapeHtml(artistName);
  const eCity = escapeHtml(city);
  const eTierLabel = escapeHtml(tierLabel);

  await getResend().emails.send({
    from: "Summon <hello@wesummon.com>",
    to: email,
    subject: `${votesNeeded} more votes to unlock ${tierLabel} for ${artistName} in ${city}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#fff">Almost there 🔥</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:15px">${eArtist} in ${eCity} is closing in on the next milestone.</p>

        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em">Artist · City</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#fff">${eArtist} in ${eCity}</p>
        </div>

        <div style="background:#0d0d1a;border:1px solid #2a2a4a;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:28px;font-weight:800;color:#a78bfa">${votesNeeded}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#aaa">more votes to unlock <strong style="color:#fff">${eTierLabel}</strong></p>
          <p style="margin:8px 0 0;font-size:13px;color:#666">${voteCount.toLocaleString()} votes so far — share to push it over the line.</p>
        </div>

        <a href="${artistUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          Share &amp; vote →
        </a>

        <p style="color:#555;font-size:12px;margin-top:32px">Summon · Fan-driven shows · <a href="https://wesummon.com" style="color:#555">wesummon.com</a> · <a href="https://wesummon.com/settings" style="color:#555">Manage email preferences</a></p>
      </div>
    `,
  });
}

async function sendThresholdEmail(
  email: string,
  artistName: string,
  city: string,
  voteCount: number,
  tier: typeof THRESHOLDS[number]["tier"],
  tierLabel: string,
) {
  const venues = getVenuesForCity(city);
  const venueName = venues[tier]?.[0] ?? tierLabel;
  const nextThreshold = THRESHOLDS.find((t) => t.votes > voteCount);
  const artistPath = ARTISTS.find((a) => a.name === artistName)?.id;
  const artistUrl = `https://wesummon.com${artistPath ? `/artist/${artistPath}` : "/explore"}`;
  const eArtist = escapeHtml(artistName);
  const eCity = escapeHtml(city);
  const eVenue = escapeHtml(venueName);

  await getResend().emails.send({
    from: "Summon <hello@wesummon.com>",
    to: email,
    subject: `${artistName} just hit ${voteCount.toLocaleString()} votes in ${city} 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#fff">You helped make this happen 🎉</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:15px">A vote threshold was just reached.</p>

        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em">Artist · City</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#fff">${eArtist} in ${eCity}</p>
        </div>

        <p style="color:#d4d4d4;font-size:15px;line-height:1.6">
          <strong style="color:#fff">${voteCount.toLocaleString()} fans</strong> have voted — enough to trigger outreach to
          <strong style="color:#a78bfa">${eVenue}</strong>. We're reaching out to see if we can make this show happen.
        </p>

        ${nextThreshold ? `
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:14px;margin-top:20px">
          <p style="margin:0;font-size:13px;color:#888">Next milestone</p>
          <p style="margin:4px 0 0;font-size:15px;color:#fff;font-weight:600">${nextThreshold.votes.toLocaleString()} votes → ${escapeHtml(nextThreshold.label)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#666">Share Summon with more fans to keep the momentum going.</p>
        </div>
        ` : ""}

        <a href="${artistUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          View ${eArtist} on Summon →
        </a>

        <p style="color:#555;font-size:12px;margin-top:28px">Want to be notified first next time? <a href="https://wesummon.com/superfan" style="color:#7c7c7c">Become a Superfan</a>.</p>
        <p style="color:#555;font-size:12px;margin-top:12px">Summon · Fan-driven shows · <a href="https://wesummon.com" style="color:#555">wesummon.com</a> · <a href="https://wesummon.com/settings" style="color:#555">Manage email preferences</a></p>
      </div>
    `,
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: votes } = await supabase
    .from("votes")
    .select("artist_id, city")
    .eq("user_id", user.id);

  return NextResponse.json({ votes: votes ?? [] });
}

export async function POST(request: Request) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!await checkRateLimit(`votes:${ip}`, 30, 60)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let artistId: string, city: string;
  try {
    ({ artistId, city } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!VALID_CITIES.has(city)) {
    return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  const isStaticArtist = VALID_ARTIST_IDS.has(artistId);
  if (!isStaticArtist) {
    const { data } = await supabase.from("live_artists").select("id").eq("id", artistId).single();
    if (!data) return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  // Atomic insert + count via RPC — eliminates the non-atomic
  // SELECT COUNT → INSERT race that caused duplicate threshold emails.
  const { data: voteResult, error: rpcError } = await supabase.rpc("cast_vote", {
    p_user_id:   user.id,
    p_artist_id: artistId,
    p_city:      city,
  });

  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  const inserted: boolean = voteResult?.inserted ?? false;
  const voteCount: number = voteResult?.vote_count ?? 0;

  // Only run threshold/warning logic when this was a fresh vote
  if (inserted) {
    const before = voteCount - 1;
    const after = voteCount;
    const crossed = THRESHOLDS.find((t) => before < t.votes && after >= t.votes);
    if (crossed) {
      const staticArtist = ARTISTS.find((a) => a.id === artistId);
      const artistName = staticArtist?.name ?? (await (async () => {
        const { data } = await supabase.from("live_artists").select("name").eq("id", artistId).single();
        return data?.name;
      })());
      if (artistName) {
        if (user.email) {
          // Respect email notification preferences
          const { data: prof } = await supabase.from("profiles").select("notifications_email").eq("id", user.id).single();
          if (prof?.notifications_email !== false) {
            sendThresholdEmail(user.email, artistName, city, after, crossed.tier, crossed.label)
              .catch(() => {});
          }
        }
        sendOutreachAlert(artistName, city, after, crossed.tier, crossed.label)
          .catch(() => {});
        // Auto-email matching promoters directly
        sendAutomatedOutreach(artistId, artistName, city, after, crossed.tier, crossed.label)
          .catch(() => {});
        // Queue artist booking/manager contact for outreach
        queueArtistContactOutreach(artistId, artistName, city, after, crossed.tier, crossed.label)
          .catch(() => {});
        // Fire Make.com webhook for automated social posting
        if (process.env.MAKE_WEBHOOK_URL) {
          const artistSlug = artistName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          const citySlug = city.toLowerCase().replace(/\s+/g, "-");
          fetch(process.env.MAKE_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              artistName,
              city,
              voteCount: after,
              tier: crossed.tier,
              tierLabel: crossed.label,
              url: `https://wesummon.com/live/${artistSlug}/${citySlug}`,
            }),
          }).catch(() => {});
        }
        // Push notification to voter
        void createAdminClient()
          .from("push_tokens").select("token").eq("user_id", user.id).eq("platform", "ios").single()
          .then(({ data }) => {
            if (data?.token) {
              void sendPush(data.token, {
                title: `${artistName} hit ${after.toLocaleString()} votes in ${city} 🎉`,
                body: "You helped make this happen. We're reaching out to promoters now.",
              });
            }
          });
      }
    }

    // "50 votes away" warning — fires once as a combo enters the final stretch
    const WARNING_DISTANCE = 50;
    const warning = THRESHOLDS.find(
      (t) => before < t.votes - WARNING_DISTANCE && after >= t.votes - WARNING_DISTANCE && after < t.votes
    );
    if (warning) {
      const staticArtist = ARTISTS.find((a) => a.id === artistId);
      const artistName = staticArtist?.name ?? (await (async () => {
        const { data } = await supabase.from("live_artists").select("name").eq("id", artistId).single();
        return data?.name;
      })());
      if (artistName) {
        if (user.email) {
          // Respect email notification preferences
          const { data: prof } = await supabase.from("profiles").select("notifications_email").eq("id", user.id).single();
          if (prof?.notifications_email !== false) {
            sendWarningEmail(user.email, artistName, city, after, warning.votes - after, warning.label)
              .catch(() => {});
          }
        }
        // Pre-fetch booking contact so it's ready when threshold is crossed
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
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let artistId: string, city: string;
  try {
    ({ artistId, city } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!VALID_CITIES.has(city)) {
    return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  if (!VALID_ARTIST_IDS.has(artistId)) {
    const { data } = await supabase.from("live_artists").select("id").eq("id", artistId).single();
    if (!data) return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .eq("city", city);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
