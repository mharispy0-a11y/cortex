"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/server/actions/workspaces";

export function AcceptInviteButton({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await acceptInvite(token);
          // Success redirects to /dashboard.
          if (result?.error) toast.error(result.error);
        })
      }
    >
      {isPending && (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      )}
      Accept invitation
    </Button>
  );
}
