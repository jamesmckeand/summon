import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ARTISTS } from "@/lib/data/artists";

// Normalise a name for fuzzy matching (lowercase, strip punctuation)
function normaliseName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

// Match a list of external artist names against our static catalogue
function matchArtists(externalNames: string[]): string[] {
  const normalised = ARTISTS.map((a) => ({ id: a.id, norm: normaliseName(a.name) }));
  const ids: string[] = [];
  for (const name of externalNames) {
    const norm = normaliseName(name);
    const match = normalised.find((a) => a.norm === norm);
    if (match) ids.push(match.id);
  }
  return ids;
}

async function importSpotifyTopArtists(providerToken: string, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    // Only import if the profile has no favourite artists yet
    const { data: profile } = await supabase
      .from("profiles")
      .select("favourite_artists")
      .eq("id", userId)
      .single();

    if (profile?.favourite_artists?.length > 0) return; // already has favourites

    const res = await fetch("https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term", {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    if (!res.ok) return;

    const data = await res.json();
    const names: string[] = (data.items ?? []).map((a: { name: string }) => a.name);
    const matchedIds = matchArtists(names);
    if (matchedIds.length === 0) return;

    await supabase
      .from("profiles")
      .upsert({ id: userId, favourite_artists: matchedIds }, { onConflict: "id" });
  } catch {
    // Non-fatal — login still succeeds
  }
}

async function importAppleMusicTopArtists(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  // Apple Music API requires a separate Music User Token (not the OAuth token).
  // This needs to be done client-side via MusicKit JS after login.
  // Placeholder — see /api/import-apple-music route for the client-side flow.
  void userId; void supabase;
}

const ALLOWED_NEXT_PATHS = new Set([
  "/explore", "/dashboard", "/profile", "/shows", "/cities", "/submit", "/onboarding",
  "/leaderboard", "/superfan", "/help", "/about",
]);

function safeNext(raw: string | null): string {
  if (!raw) return "/explore";
  // Must be a relative path starting with / but not //  (open redirect via //evil.com)
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/explore";
  // Allow /artist/*, /cities/* as dynamic sub-paths
  if (raw.startsWith("/artist/") || raw.startsWith("/cities/")) return raw;
  return ALLOWED_NEXT_PATHS.has(raw) ? raw : "/explore";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Import top artists based on provider
        const provider = sessionData?.session?.user?.app_metadata?.provider;
        const providerToken = sessionData?.session?.provider_token;

        if (provider === "spotify" && providerToken) {
          await importSpotifyTopArtists(providerToken, user.id, supabase);
        }
        // Apple Music import is client-side (MusicKit JS) — handled separately

        const { data: profile } = await supabase
          .from("profiles")
          .select("city")
          .eq("id", user.id)
          .single();

        // Credit referral if present (non-fatal — never blocks login)
        const cookieStore = await cookies();
        const refCookie = cookieStore.get("summon_ref");
        if (refCookie?.value && refCookie.value !== user.id) {
          const admin = createAdminClient();
          // Only credit once per referred user (prevent double-credit on re-login)
          const { count } = await admin
            .from("referrals")
            .select("*", { count: "exact", head: true })
            .eq("referred_id", user.id);
          if (count === 0) {
            void admin.from("referrals")
              .insert({ referrer_id: refCookie.value, referred_id: user.id });
          }
        }

        const destination = profile?.city ? next : "/onboarding";
        const redirectResponse = NextResponse.redirect(`${origin}${destination}`);

        // Clear the referral cookie after use
        if (refCookie) {
          redirectResponse.cookies.delete("summon_ref");
        }

        return redirectResponse;
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
