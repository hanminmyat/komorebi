import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle error from Supabase auth
  if (error) {
    const errorMessage = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      const errorMessage = encodeURIComponent(sessionError.message);
      return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
    }

    // Successfully verified — redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code or error — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
