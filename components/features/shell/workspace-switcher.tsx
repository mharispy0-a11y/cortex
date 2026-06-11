"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveWorkspace } from "@/server/actions/workspaces";

export type WorkspaceItem = {
  id: string;
  name: string;
};

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const active =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  if (!active) return null;

  function switchTo(id: string) {
    if (id === activeWorkspaceId) return;
    startTransition(async () => {
      const result = await setActiveWorkspace(id);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white"
          aria-hidden="true"
        >
          {active.name.charAt(0).toUpperCase()}
        </span>
        <span className="truncate font-medium">{active.name}</span>
        {isPending ? (
          <Loader2
            className="ml-auto size-3.5 shrink-0 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <ChevronsUpDown
            className="ml-auto size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => switchTo(workspace.id)}
          >
            <span className="truncate">{workspace.name}</span>
            {workspace.id === activeWorkspaceId && (
              <Check className="ml-auto size-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding">
            <Plus className="size-4" aria-hidden="true" />
            Create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
