import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Cheap first gate: verifies the JWT signature so unauthenticated traffic never
 * reaches the admin render path. It deliberately does NOT hit the database,
 * because this runs on the Edge runtime. The authoritative check lives in
 * `requireUser()`, which every admin page and Server Action calls.
 *
 * Named `proxy` and living in proxy.ts: Next 16 renamed the middleware
 * convention.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
