import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);

  // Rate limit auth routes (login, signup, callback)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/")
  ) {
    const { success } = rateLimit(`auth:${ip}`, {
      limit: 20,
      windowSeconds: 60,
    });
    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  // Rate limit share pages (token enumeration protection)
  if (pathname.startsWith("/share/")) {
    const { success } = rateLimit(`share:${ip}`, {
      limit: 60,
      windowSeconds: 60,
    });
    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    // Skip session refresh for public share pages — anonymous visitors
    // don't have sessions, so there's nothing to refresh
    const hasSession =
      request.cookies.has("sb-access-token") ||
      request.cookies.has("sb-refresh-token");
    if (!hasSession) {
      return;
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
