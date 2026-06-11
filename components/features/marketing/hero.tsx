import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

const citations = ["onboarding-guide.pdf", "security-policy.md"];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow — decorative only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-40 right-[10%] h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
        <FadeIn>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-xl">
            <Sparkles className="size-3.5 text-indigo-400" aria-hidden="true" />
            Retrieval-augmented answers for your team
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Chat with your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              knowledge
            </span>
            .
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            Upload your team&apos;s documents and ask anything. Cortex answers
            only from what you&apos;ve shared — with citations to prove it.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="shadow-[0_0_32px_-8px] shadow-indigo-500/60"
            >
              <Link href="/dashboard">
                Start for free
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </FadeIn>

        {/* Chat preview */}
        <FadeIn delay={0.45} y={24} className="mt-16 w-full max-w-2xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:p-6">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500/90 px-4 py-2.5 text-sm text-white">
                What&apos;s our policy on sharing customer data with vendors?
              </p>
            </div>

            <div className="mt-4 flex max-w-[90%] flex-col gap-3">
              <div className="rounded-2xl rounded-bl-md border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm leading-relaxed text-zinc-200">
                Customer data may only be shared with vendors who have signed a
                DPA, and only the minimum fields required. Engineering must
                approve any new vendor integration first
                <span className="typing-cursor" aria-hidden="true" />
              </div>
              <div className="flex flex-wrap gap-2">
                {citations.map((source) => (
                  <span
                    key={source}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-xs text-indigo-300"
                  >
                    <FileText className="size-3" aria-hidden="true" />
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
