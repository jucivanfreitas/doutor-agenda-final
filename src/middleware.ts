import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware: check for better-auth cookies (Edge-safe, no DB imports)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = ["/dashboard", "/appointments", "/patients"].some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Detect the real cookies emitted by better-auth
  const token =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("better-auth.session_data")?.value;

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/authentication";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/appointments/:path*", "/patients/:path*"],
};
