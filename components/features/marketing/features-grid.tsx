import { BarChart3, FileUp, MessagesSquare } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const features = [
  {
    icon: FileUp,
    title: "Upload anything",
    description:
      "Drop in PDFs, Markdown, and text files. Cortex chunks, embeds, and indexes them into your workspace's private knowledge base.",
  },
  {
    icon: MessagesSquare,
    title: "Ask with citations",
    description:
      "Every answer streams in real time and cites the exact source documents it came from. If it's not in your docs, Cortex says so.",
  },
  {
    icon: BarChart3,
    title: "See every query",
    description:
      "Track questions asked, documents indexed, and token usage per workspace from a clean analytics dashboard.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn inView className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your documents, doing the talking
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Cortex turns a folder of files into a teammate that has read
            everything — and never makes things up.
          </p>
        </FadeIn>

        <Stagger inView className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <article className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:shadow-[0_8px_40px_-12px] hover:shadow-indigo-500/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 transition-colors group-hover:bg-indigo-500/20">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
