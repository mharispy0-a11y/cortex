"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWorkspaceSchema,
  type CreateWorkspaceValues,
} from "@/lib/validation/workspace";
import { createWorkspace } from "@/server/actions/workspaces";

export function CreateWorkspaceForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: CreateWorkspaceValues) {
    startTransition(async () => {
      const result = await createWorkspace(values);
      // Success redirects to /dashboard, so reaching here means an error.
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          placeholder="Acme Inc"
          autoFocus
          aria-invalid={!!form.formState.errors.name}
          {...form.register("name")}
        />
        <p className="text-xs text-muted-foreground">
          Usually your team or company name. You can rename it later.
        </p>
        {form.formState.errors.name && (
          <p role="alert" className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        Create workspace
      </Button>
    </form>
  );
}
