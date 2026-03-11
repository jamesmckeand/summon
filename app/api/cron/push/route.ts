import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToTokens } from "@/lib/apns";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Find users inactive for 7+ days who have push tokens
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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

  if (inactiveIds.length === 0) return NextResponse.json({ sent: 0 });

  // Get push tokens for inactive users
  const { data: tokenRows } = await admin
    .from("push_tokens")
    .select("token")
    .in("user_id", inactiveIds)
    .eq("platform", "ios");

  const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);
  if (tokens.length === 0) return NextResponse.json({ sent: 0 });

  const sent = await sendPushToTokens(tokens, {
    title: "A lot has changed in your city 🎶",
    body: "Some artists are just votes away from unlocking a new venue. Come see where things stand.",
  }).catch(() => 0);

  return NextResponse.json({ sent });
}
