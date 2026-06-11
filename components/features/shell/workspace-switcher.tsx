"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data until Supabase workspaces land in Milestone 2.
const workspaces = [{ id: "acme", name: "Acme Inc" }];
const activeWorkspaceId = "acme";

export function WorkspaceSwitcher() {
  const active = workspaces.find((w) => w.id === activeWorkspaceId)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white"
          aria-hidden="true"
        >
          {active.name.charAt(0)}
        </span>
        <span className="truncate font-medium">{active.name}</span>
        <ChevronsUpDown
          className="ml-auto size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id}>
            <span className="truncate">{workspace.name}</span>
            {workspace.id === activeWorkspaceId && (
              <Check className="ml-auto size-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Plus className="size-4" aria-hidden="true" />
          Create workspace
          <span className="ml-auto text-xs text-muted-foreground">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
