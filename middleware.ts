import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BYPASS_COOKIE = "summon_preview";

export function middleware(request: NextRequest) {
  // Only active when COMING_SOON=true
  if (process.env.COMING_SOON !== "true") return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Always allow through
  if (
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for preview token in URL — sets a 7-day bypass cookie
  const urlToken = request.nextUrl.searchParams.get("preview");
  const launchToken = process.env.LAUNCH_TOKEN;
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
  if (launchToken && cookie === launchToken) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/coming-soon", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
