"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { ACTIVE_WORKSPACE_COOKIE, getAppUrl } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  signupSchema,
  type LoginValues,
  type SignupValues,
} from "@/lib/validation/auth";

export type ActionResult = {
  error?: string;
  success?: string;
};

function safeNext(next: string | undefined) {
  // Only allow internal redirects — never an absolute URL from user input.
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export async function signInWithPassword(
  values: LoginValues,
  next?: string
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        error.code === "invalid_credentials"
          ? "Invalid email or password."
          : error.message,
    };
  }

  redirect(safeNext(next));
}

export async function signUpWithPassword(
  values: SignupValues
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getAppUrl()}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase obfuscates duplicate signups by returning a user with no
  // identities instead of an error.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists. Sign in instead." };
  }

  // When email confirmation is disabled, a session is created immediately.
  if (data.session) {
    redirect("/onboarding");
  }

  return {
    success: "Check your inbox — we sent you a confirmation link.",
  };
}

export async function signInWithGoogle(next?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });

  if (error || !data.url) {
    // Honest stub: provider not configured in the Supabase dashboard yet.
    return {
      error:
        "Google sign-in isn't configured yet — use email and password for now.",
    };
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WORKSPACE_COOKIE);

  redirect("/login");
}
