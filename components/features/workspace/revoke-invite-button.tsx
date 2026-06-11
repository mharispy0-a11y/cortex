"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { revokeInvite } from "@/server/actions/workspaces";

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      aria-label="Revoke invite"
      className="text-muted-foreground hover:text-destructive"
      onClick={() =>
        startTransition(async () => {
          const result = await revokeInvite(inviteId);
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Invite revoked");
          }
        })
      }
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
