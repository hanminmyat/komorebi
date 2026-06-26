import { createClient } from "@supabase/supabase-js";

/**
 * Service role client — bypasses RLS.
 * Use only in server-side code that needs to generate signed URLs
 * for unauthenticated users (e.g., share pages).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY env var.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
