import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <FadeIn inView>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-6 py-16 text-center backdrop-blur-xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop searching. Start asking.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              Give your team an assistant that has actually read the docs.
              Free to start — no credit card required.
            </p>
            <Button
              size="lg"
              asChild
              className="mt-8 shadow-[0_0_32px_-8px] shadow-indigo-500/60"
            >
              <Link href="/dashboard">
                Create your workspace
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
