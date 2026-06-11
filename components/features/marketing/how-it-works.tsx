import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const steps = [
  {
    step: "01",
    title: "Create a workspace",
    description:
      "Spin up a private workspace for your team and invite the people who need answers.",
  },
  {
    step: "02",
    title: "Upload your documents",
    description:
      "Handbooks, specs, policies, runbooks — Cortex indexes them in seconds and keeps them private to your workspace.",
  },
  {
    step: "03",
    title: "Ask anything",
    description:
      "Get streamed, cited answers grounded in your own knowledge base. No hallucinated facts, no stale wiki pages.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-white/5 bg-white/[0.015]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn inView className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From folder to fluent in minutes
          </h2>
        </FadeIn>

        <Stagger inView interval={0.08} className="mt-14 grid gap-10 sm:grid-cols-3">
          {steps.map((item) => (
            <StaggerItem key={item.step}>
              <div className="relative">
                <span
                  className="font-mono text-sm font-medium text-indigo-400"
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
