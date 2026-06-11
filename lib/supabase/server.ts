import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Uses the anon key — RLS is the security boundary.
 */
export async function createClient() {
  // cookies() first: it marks the route dynamic, which keeps Next from
  // trying to statically prerender auth-dependent pages at build time
  // (where env vars may be absent and the check below would throw).
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore because the
          // middleware refreshes sessions before this code runs.
        }
      },
    },
  });
}
