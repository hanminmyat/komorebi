import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip session refresh for public share pages — anonymous visitors
  // don't have sessions, so there's nothing to refresh
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/share/")) {
    // Only refresh if the visitor already has a session cookie
    const hasSession = request.cookies.has("sb-access-token") || request.cookies.has("sb-refresh-token");
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
