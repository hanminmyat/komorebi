import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle error from Supabase auth — never leak internal error details
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Successfully verified — redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code or error — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
