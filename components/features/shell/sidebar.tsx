import Link from "next/link";

import { SidebarNav } from "@/components/features/shell/sidebar-nav";
import { WorkspaceSwitcher } from "@/components/features/shell/workspace-switcher";
import { Logo } from "@/components/ui/logo";

export function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5">
      <Link
        href="/"
        className="rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Logo />
        <span className="sr-only">Cortex home</span>
      </Link>
      <WorkspaceSwitcher />
      <SidebarNav />
      <p className="mt-auto px-1 text-xs text-muted-foreground/60">
        Free plan · Milestone 1
      </p>
    </div>
  );
}
