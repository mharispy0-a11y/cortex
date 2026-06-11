import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateWorkspaceForm } from "@/components/features/workspace/create-workspace-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Logo } from "@/components/ui/logo";
import { getSessionContext } from "@/server/queries";

export const metadata: Metadata = {
  title: "Create your workspace",
};

export default async function OnboardingPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  // Users who already belong to a workspace don't need onboarding —
  // but they can still reach this page deliberately via "Create workspace".
  const isFirstWorkspace = session.workspaces.length === 0;

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
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
            <h1 className="text-xl font-semibold tracking-tight">
              {isFirstWorkspace
                ? `Welcome${session.profile.full_name ? `, ${session.profile.full_name.split(" ")[0]}` : ""}! Create your workspace`
                : "Create another workspace"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              A workspace is where your team&apos;s documents and conversations
              live.
            </p>
            <div className="mt-6">
              <CreateWorkspaceForm />
            </div>
          </div>
        </FadeIn>
        {!isFirstWorkspace && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href="/dashboard"
              className="font-medium text-indigo-300 underline-offset-4 hover:underline"
            >
              Back to dashboard
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
