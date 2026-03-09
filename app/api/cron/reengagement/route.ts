import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Verify this is a legitimate Vercel cron call
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Find user_ids with votes but none in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Users who voted at some point in the last 30 days but not the last 7
  const { data: recentVoters } = await admin
    .from("votes")
    .select("user_id")
    .gt("created_at", sevenDaysAgo);

  const recentIds = new Set((recentVoters ?? []).map((r: { user_id: string }) => r.user_id));

  const { data: olderVoters } = await admin
    .from("votes")
    .select("user_id")
    .gt("created_at", thirtyDaysAgo)
    .lte("created_at", sevenDaysAgo);

  const inactiveIds = [...new Set(
    (olderVoters ?? [])
      .map((r: { user_id: string }) => r.user_id)
      .filter((id: string) => !recentIds.has(id))
  )];

  if (inactiveIds.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Get emails from auth.users via admin API
  // Supabase admin.listUsers paginates at 1000 — fine for launch scale
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });

  const targets = users.filter((u) => inactiveIds.includes(u.id) && u.email);

  let sent = 0;
  for (const user of targets) {
    if (!user.email) continue;
    await resend.emails.send({
      from: "Summon <hello@wesummon.com>",
      to: user.email,
      subject: "A lot has changed in your city this week 🎶",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
          <h2 style="margin:0 0 8px;font-size:22px;color:#fff">Miss anything?</h2>
          <p style="color:#aaa;margin:0 0 24px;font-size:15px">
            Votes have been rolling in across cities you follow. Come see where your artists stand.
          </p>

          <div style="background:#111;border:1px solid #222;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;color:#d4d4d4;line-height:1.6">
              Some cities are just a few votes from unlocking the next venue tier.
              Every vote counts — invite a friend and tip it over the line.
            </p>
          </div>

          <a href="https://wesummon.com/explore" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
            See what's happening →
          </a>

          <p style="color:#555;font-size:12px;margin-top:32px">
            Summon · Fan-driven shows · <a href="https://wesummon.com" style="color:#555">wesummon.com</a>
          </p>
        </div>
      `,
    }).catch(() => {});
    sent++;
  }

  return NextResponse.json({ sent });
}
