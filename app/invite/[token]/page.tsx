import type { Metadata } from "next";
import { MailOpen } from "lucide-react";

import { AcceptInviteButton } from "@/components/features/workspace/accept-invite-button";
import { FadeIn } from "@/components/motion/fade-in";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Workspace invitation",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      <main id="main" className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <FadeIn>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
            <span
              className="mx-auto flex size-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
              aria-hidden="true"
            >
              <MailOpen className="size-6" />
            </span>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">
              You&apos;ve been invited
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Accept to join the workspace with the account you&apos;re signed
              in as. The invite only works for the email it was sent to.
            </p>
            <div className="mt-6">
              <AcceptInviteButton token={token} />
            </div>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
