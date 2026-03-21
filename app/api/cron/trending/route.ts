import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllUsers } from "@/lib/supabase/list-all-users";
import { ARTISTS } from "@/lib/data/artists";
import { artistToSlug } from "@/lib/utils/artist-slug";
import { cityToSlug } from "@/lib/utils/city-slug";

const resend = new Resend(process.env.RESEND_API_KEY);

const THRESHOLDS = [500, 2500, 7500, 25000];
const THRESHOLD_LABELS = ["Bar / Club", "Theatre", "Concert Hall", "Arena"];

function getNextThreshold(votes: number): { votes: number; label: string } | null {
  const idx = THRESHOLDS.findIndex((t) => t > votes);
  if (idx === -1) return null;
  return { votes: THRESHOLDS[idx], label: THRESHOLD_LABELS[idx] };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Find combos within 20% of the next threshold
  const { data: voteCounts } = await admin
    .from("vote_counts")
    .select("artist_id, city, vote_count")
    .order("vote_count", { ascending: false })
    .limit(500);

  type NearCombo = {
    artistName: string;
    city: string;
    votes: number;
    needed: number;
    nextLabel: string;
    url: string;
  };

  const nearCombos: NearCombo[] = [];

  for (const row of voteCounts ?? []) {
    const next = getNextThreshold(Number(row.vote_count));
    if (!next) continue;
    const needed = next.votes - Number(row.vote_count);
    const pct = Number(row.vote_count) / next.votes;
    if (pct >= 0.8 && pct < 1) {
      const artist = ARTISTS.find((a) => a.id === row.artist_id);
      if (!artist) continue;
      nearCombos.push({
        artistName: artist.name,
        city: row.city,
        votes: Number(row.vote_count),
        needed,
        nextLabel: next.label,
        url: `https://wesummon.com/live/${artistToSlug(artist.name)}/${cityToSlug(row.city)}`,
      });
    }
  }

  // Top 3 closest to tipping
  const top = nearCombos
    .sort((a, b) => a.needed - b.needed)
    .slice(0, 3);

  if (top.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no near-threshold combos" });
  }

  // Get all users who have ever voted and have email notifications enabled
  const users = await listAllUsers(admin);
  const { data: voterRows } = await admin
    .from("votes")
    .select("user_id");

  const voterIds = new Set((voterRows ?? []).map((r: { user_id: string }) => r.user_id));
  const voterIdList = [...voterIds];

  const { data: optedIn } = await admin
    .from("profiles")
    .select("id")
    .in("id", voterIdList)
    .neq("notifications_email", false);

  const optedInIds = new Set((optedIn ?? []).map((p: { id: string }) => p.id));
  const targets = users.filter((u) => optedInIds.has(u.id) && u.email);

  const comboRows = top.map((c) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a">
        <a href="${c.url}" style="color:#a78bfa;text-decoration:none;font-weight:600">${c.artistName}</a>
        <span style="color:#666;font-size:12px"> in ${c.city}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;text-align:right;color:#fff;font-weight:600">${c.votes.toLocaleString()}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;text-align:right;color:#ec4899;font-weight:700">${c.needed.toLocaleString()} to go</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px">${c.nextLabel}</td>
    </tr>
  `).join("");

  let sent = 0;
  for (const user of targets) {
    if (!user.email) continue;
    await resend.emails.send({
      from: "Summon <hello@wesummon.com>",
      to: user.email,
      subject: `${top[0].needed} votes away — ${top[0].artistName} in ${top[0].city} is almost there`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
          <h2 style="margin:0 0 4px;font-size:22px;color:#fff">This week's closest calls 🔥</h2>
          <p style="color:#aaa;margin:0 0 24px;font-size:14px">These shows are within touching distance. A share could tip them over.</p>

          <table style="width:100%;border-collapse:collapse;background:#111;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <thead>
              <tr style="background:#1a1a1a">
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.05em">Artist · City</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.05em">Votes</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.05em">Needed</th>
                <th style="padding:10px 16px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.05em">Tier</th>
              </tr>
            </thead>
            <tbody>${comboRows}</tbody>
          </table>

          <a href="https://wesummon.com/explore" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
            Vote &amp; share →
          </a>

          <p style="color:#555;font-size:12px;margin-top:32px">Summon · Fan-driven shows · <a href="https://wesummon.com" style="color:#555">wesummon.com</a> · <a href="https://wesummon.com/settings" style="color:#555">Manage email preferences</a></p>
        </div>
      `,
    }).catch(() => {});
    sent++;
  }

  return NextResponse.json({ sent, combos: top.length });
}
