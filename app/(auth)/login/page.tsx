import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const errorMessages: Record<string, string> = {
  confirmation_failed:
    "That confirmation link is invalid or expired. Try signing in, or sign up again.",
  oauth_failed: "Sign-in with the provider failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const errorMessage = error ? (errorMessages[error] ?? null) : null;

  return (
    <>
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </div>
      )}
      <LoginForm next={next} />
    </>
  );
}
