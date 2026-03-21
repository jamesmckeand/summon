import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";

const ARTIST_MAP = new Map(ARTISTS.map((a) => [a.id, a.name]));
const VALID_CITIES = new Set(CITIES);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "";
  const requestingUserId = searchParams.get("userId") ?? "";

  const admin = createAdminClient();

  // Fetch votes — filter by city if provided
  let query = admin
    .from("votes")
    .select("user_id, artist_id, city");

  if (city && VALID_CITIES.has(city)) {
    query = query.eq("city", city) as typeof query;
  }

  const { data: votes } = await query.limit(50000);
  if (!votes?.length) {
    return NextResponse.json({ users: [], currentUser: null }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  }

  // Count votes per user
  const countMap = new Map<string, number>();
  for (const v of votes) {
    countMap.set(v.user_id, (countMap.get(v.user_id) ?? 0) + 1);
  }

  // Sort all users by vote count to determine full rankings
  const allRanked = [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([userId, count], i) => ({ userId, count, rank: i + 1 }));

  // Top 50
  const topUsers = allRanked.slice(0, 50);
  const userIds = topUsers.map((u) => u.userId);

  // If requesting user is outside top 50, include them too for profile lookup
  const requestingUserInTop = requestingUserId ? topUsers.some((u) => u.userId === requestingUserId) : true;
  const lookupIds = requestingUserId && !requestingUserInTop
    ? [...userIds, requestingUserId]
    : userIds;

  // Look up profiles
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, city")
    .in("id", lookupIds);

  // Look up Superfan subscriptions
  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("user_id", lookupIds)
    .eq("status", "active");

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, { username: p.username, homeCity: p.city }]));
  const superfanSet = new Set((subs ?? []).map((s) => s.user_id));

  const users = topUsers.map(({ userId, count, rank }) => ({
    rank,
    userId,
    username: profileMap.get(userId)?.username ?? null,
    homeCity: profileMap.get(userId)?.homeCity ?? null,
    voteCount: count,
    isSuperfan: superfanSet.has(userId),
  }));

  // Build current user's entry if they're outside top 50
  let currentUser = null;
  if (requestingUserId && !requestingUserInTop) {
    const entry = allRanked.find((u) => u.userId === requestingUserId);
    if (entry) {
      currentUser = {
        rank: entry.rank,
        userId: entry.userId,
        username: profileMap.get(entry.userId)?.username ?? null,
        homeCity: profileMap.get(entry.userId)?.homeCity ?? null,
        voteCount: entry.count,
        isSuperfan: superfanSet.has(entry.userId),
      };
    }
  }

  return NextResponse.json({ users, currentUser }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
  });
}
