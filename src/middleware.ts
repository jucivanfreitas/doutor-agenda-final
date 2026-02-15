import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import { getActiveClinicId } from "@/services/clinic.service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getOrCreateCorrelationId(req: NextRequest) {
  const header = req.headers.get("x-correlation-id");
  if (header) return header;
  try {
    // node 18+ / edge may support crypto
    // fallback to random string

    const { randomUUID } = require("crypto");
    return randomUUID();
  } catch (e) {
    return String(Math.floor(Math.random() * 1_000_000_000));
  }
}

export function middleware(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  // Allow public routes (authentication, auth API, next internals, favicon)
  const publicRoutes = [
    "/authentication",
    "/api/auth",
    "/_next",
    "/favicon.ico",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isPublicRoute) {
    const res = NextResponse.next();
    res.headers.set("x-correlation-id", correlationId);
    return res;
  }
  // Try to resolve session and active clinic id. If not available, redirect
  // user to authentication or clinic-form as appropriate.
  try {
    // `auth.api.getSession` expects headers; pass the incoming request headers.
    const sessionPromise = auth.api.getSession({
      headers: request.headers as any,
    });
    return sessionPromise.then((session) => {
      if (!session?.user) {
        const res = NextResponse.redirect(
          new URL("/authentication", request.url),
        );
        res.headers.set("x-correlation-id", correlationId);
        return res;
      }
      // resolve clinic id from session or fallback to service
      const clinicIdFromSession = session.user.clinic?.id as string | undefined;
      return Promise.resolve(
        (async () => {
          const clinicId =
            clinicIdFromSession ?? (await getActiveClinicId(session.user.id));
          if (!clinicId) {
            const res = NextResponse.redirect(
              new URL("/clinic-form", request.url),
            );
            res.headers.set("x-correlation-id", correlationId);
            return res;
          }
          const res = NextResponse.next();
          res.headers.set("x-correlation-id", correlationId);
          res.headers.set("x-clinic-id", clinicId);
          return res;
        })(),
      );
    });
  } catch (e) {
    const res = NextResponse.redirect(new URL("/authentication", request.url));
    res.headers.set("x-correlation-id", correlationId);
    return res;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard",
    "/patients",
    "/doctors",
    "/appointments",
    "/subscription",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
