import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3, FileSearch, FileText, MessagesSquare } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionContext } from "@/server/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Real values arrive with ingestion (M3) and analytics (M5); zeros are honest for now.
const stats = [
  { label: "Documents indexed", value: "0", icon: FileText },
  { label: "Queries this month", value: "0", icon: MessagesSquare },
  { label: "Tokens used", value: "0", icon: BarChart3 },
];

export default async function DashboardPage() {
  const session = await getSessionContext();
  if (!session?.activeWorkspace) redirect("/onboarding");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome to {session.activeWorkspace.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your workspace.
        </p>
      </div>

      <Stagger className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_8px_32px_-12px] hover:shadow-indigo-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon
                  className="size-4 text-muted-foreground/60"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  No activity yet
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Stagger delay={0.15}>
        <StaggerItem>
          <Card className="relative overflow-hidden border-dashed border-white/15 bg-white/[0.02]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
            </div>
            <CardContent className="relative flex flex-col items-center px-6 py-16 text-center">
              <span
                className="flex size-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
                aria-hidden="true"
              >
                <FileSearch className="size-7" />
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">
                Your knowledge base is empty
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Upload your first documents and Cortex will index them so your
                team can start asking questions.
              </p>
              <Button disabled className="mt-6">
                Upload documents
              </Button>
              <p className="mt-3 text-xs text-muted-foreground/60">
                Document ingestion ships in Milestone 3.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
