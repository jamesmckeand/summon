import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";

const VALID_ARTIST_IDS = new Set(ARTISTS.map((a) => a.id));
const VALID_CITIES = new Set(CITIES);

const THRESHOLDS = [
  { votes: 500,   tier: "bar" as const,         label: "Bar / Club" },
  { votes: 2500,  tier: "theatre" as const,     label: "Theatre" },
  { votes: 7500,  tier: "concertHall" as const, label: "Concert Hall" },
  { votes: 25000, tier: "arena" as const,       label: "Arena" },
];

const resend = new Resend(process.env.RESEND_API_KEY);

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

  await resend.emails.send({
    from: "Summon <hello@wesummon.com>",
    to: email,
    subject: `${artistName} just hit ${voteCount.toLocaleString()} votes in ${city} 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#fff">You helped make this happen 🎉</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:15px">A vote threshold was just reached.</p>

        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em">Artist · City</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#fff">${artistName} in ${city}</p>
        </div>

        <p style="color:#d4d4d4;font-size:15px;line-height:1.6">
          <strong style="color:#fff">${voteCount.toLocaleString()} fans</strong> have voted — enough to trigger outreach to
          <strong style="color:#a78bfa">${venueName}</strong>. We're reaching out to see if we can make this show happen.
        </p>

        ${nextThreshold ? `
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:14px;margin-top:20px">
          <p style="margin:0;font-size:13px;color:#888">Next milestone</p>
          <p style="margin:4px 0 0;font-size:15px;color:#fff;font-weight:600">${nextThreshold.votes.toLocaleString()} votes → ${nextThreshold.label}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#666">Share Summon with more fans to keep the momentum going.</p>
        </div>
        ` : ""}

        <a href="${artistUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          View ${artistName} on Summon →
        </a>

        <p style="color:#555;font-size:12px;margin-top:32px">Summon · Fan-driven shows · <a href="https://wesummon.com" style="color:#555">wesummon.com</a></p>
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artistId, city } = await request.json();

  if (!VALID_ARTIST_IDS.has(artistId) || !VALID_CITIES.has(city)) {
    return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
  }

  // Count before inserting to detect threshold crossings
  const { count: countBefore } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("artist_id", artistId)
    .eq("city", city);

  const { error } = await supabase
    .from("votes")
    .insert({ user_id: user.id, artist_id: artistId, city });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if this vote crossed a threshold
  if (error?.code !== "23505" && user.email) {
    const before = countBefore ?? 0;
    const after = before + 1;
    const crossed = THRESHOLDS.find((t) => before < t.votes && after >= t.votes);
    if (crossed) {
      const artist = ARTISTS.find((a) => a.id === artistId);
      if (artist) {
        sendThresholdEmail(user.email, artist.name, city, after, crossed.tier, crossed.label)
          .catch(() => {}); // fire-and-forget, don't block the response
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artistId, city } = await request.json();

  if (!VALID_ARTIST_IDS.has(artistId) || !VALID_CITIES.has(city)) {
    return NextResponse.json({ error: "Invalid artist or city" }, { status: 400 });
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
