import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserEmailsByIds } from "@/lib/supabase/list-all-users";

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

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
  const [{ data: recentVoters }, { data: olderVoters }] = await Promise.all([
    admin.from("votes").select("user_id").gt("created_at", sevenDaysAgo),
    admin.from("votes").select("user_id").gt("created_at", thirtyDaysAgo).lte("created_at", sevenDaysAgo),
  ]);

  const recentIds = new Set((recentVoters ?? []).map((r: { user_id: string }) => r.user_id));

  const inactiveIds = [...new Set(
    (olderVoters ?? [])
      .map((r: { user_id: string }) => r.user_id)
      .filter((id: string) => !recentIds.has(id))
  )];

  if (inactiveIds.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Respect email notification preferences
  const { data: optedIn } = await admin
    .from("profiles")
    .select("id")
    .in("id", inactiveIds)
    .neq("notifications_email", false);

  const optedInIds = new Set((optedIn ?? []).map((p: { id: string }) => p.id));
  const filteredIds = inactiveIds.filter((id) => optedInIds.has(id));

  if (filteredIds.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const targets = await getUserEmailsByIds(admin, filteredIds);

  const html = `
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
        · <a href="https://wesummon.com/settings" style="color:#555">Manage email preferences</a>
      </p>
    </div>
  `;

  const emails = targets.map((u) => ({
    from: "Summon <hello@wesummon.com>",
    to: u.email,
    subject: "A lot has changed in your city this week 🎶",
    html,
  }));

  const BATCH_SIZE = 100;
  let sent = 0;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    await getResend().batch.send(emails.slice(i, i + BATCH_SIZE)).catch(() => {});
    sent += emails.slice(i, i + BATCH_SIZE).length;
  }

  return NextResponse.json({ sent });
}
