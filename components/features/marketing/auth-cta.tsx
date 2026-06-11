"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Header CTAs that adapt to auth state without making the landing page
 * dynamic: the static HTML ships the signed-out pair, and signed-in
 * visitors see it swap to "Open dashboard" right after hydration.
 * UI-only decision — the middleware remains the actual gate.
 */
export function AuthCta() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        setSignedIn(!!data.session);
      });
    } catch {
      // Supabase env missing (e.g. preview build) — keep signed-out CTAs.
    }
  }, []);

  if (signedIn) {
    return (
      <Button asChild className="shadow-[0_0_24px_-6px] shadow-indigo-500/50">
        <Link href="/dashboard">
          Open dashboard
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild className="shadow-[0_0_24px_-6px] shadow-indigo-500/50">
        <Link href="/signup">Get started</Link>
      </Button>
    </div>
  );
}
