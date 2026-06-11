import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** OAuth (PKCE) callback — exchanges the provider code for a session. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const target =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=oauth_failed", request.url)
  );
}
