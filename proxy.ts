import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const BYPASS_COOKIE = "summon_preview";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Coming soon redirect — only active when COMING_SOON=true
  if (process.env.COMING_SOON === "true") {
    const isAllowed =
      pathname.startsWith("/coming-soon") ||
      pathname.startsWith("/api/waitlist") ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon");

    if (!isAllowed) {
      const launchToken = process.env.LAUNCH_TOKEN;

      // Check for preview token in URL — sets a 7-day bypass cookie
      const urlToken = request.nextUrl.searchParams.get("preview");
      if (launchToken && urlToken === launchToken) {
        const res = NextResponse.redirect(new URL(pathname, request.url));
        res.cookies.set(BYPASS_COOKIE, launchToken, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      }

      // Check bypass cookie
      const cookie = request.cookies.get(BYPASS_COOKIE)?.value;
      if (!launchToken || cookie !== launchToken) {
        // Rewrite (not redirect) — serves coming-soon content with no HTTP round-trip,
        // eliminating the white flash a redirect causes between requests.
        return NextResponse.rewrite(new URL("/coming-soon", request.url));
      }
    }
  }

  // Supabase auth cookie refresh
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
