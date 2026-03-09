import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// UUID format — prevents arbitrary data being stored in the cookie
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && UUID_RE.test(ref)) {
    // Only set if not already attributed — first touch wins
    if (!request.cookies.get("summon_ref")) {
      response.cookies.set("summon_ref", ref, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
