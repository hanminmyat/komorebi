"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Detects a pending password recovery flow and redirects to /reset-password.
 * The forgot-password page sets a sessionStorage flag before triggering the
 * Supabase recovery email. After the user clicks the email link, Supabase's
 * verify endpoint redirects back to the app root with an access_token in the
 * URL fragment. We listen for the auth state change before redirecting.
 */
export default function RecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("komorebi-password-recovery") !== "true") {
      return;
    }

    const supabase = createClient();
    let redirected = false;

    const cleanup = () => {
      sessionStorage.removeItem("komorebi-password-recovery");
    };

    // Check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !redirected) {
        redirected = true;
        cleanup();
        router.replace("/reset-password");
      }
    });

    // Listen for the session established from the URL fragment token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && !redirected) {
          redirected = true;
          cleanup();
          subscription.unsubscribe();
          router.replace("/reset-password");
        }
      }
    );

    // Safety timeout: clear flag after 2 minutes if no session established
    const timeout = setTimeout(() => {
      if (!redirected) {
        cleanup();
        subscription.unsubscribe();
      }
    }, 120_000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
