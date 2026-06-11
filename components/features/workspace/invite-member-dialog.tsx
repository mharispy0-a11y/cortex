"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CopyButton } from "@/components/features/workspace/copy-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inviteMemberSchema,
  type InviteMemberValues,
} from "@/lib/validation/workspace";
import { inviteMember } from "@/server/actions/workspaces";

export function InviteMemberDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "member" },
    mode: "onBlur",
  });

  function onSubmit(values: InviteMemberValues) {
    startTransition(async () => {
      const result = await inviteMember(workspaceId, values);
      if (result.error) {
        toast.error(result.error);
      } else if (result.inviteLink) {
        setInviteLink(result.inviteLink);
        toast.success("Invite created");
      }
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setInviteLink(null);
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" aria-hidden="true" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Email sending isn&apos;t wired up yet — share the invite link
            directly. It expires in 7 days.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="flex flex-col gap-3">
            <Label htmlFor="invite-link">Invite link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="invite-link"
                readOnly
                value={inviteLink}
                className="font-mono text-xs"
                onFocus={(event) => event.currentTarget.select()}
              />
              <CopyButton value={inviteLink} label="Copy" />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInviteLink(null);
                form.reset();
              }}
            >
              Invite someone else
            </Button>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@company.com"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                className="h-9 rounded-md border border-input bg-input/30 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("role")}
              >
                <option value="member">Member — can view and chat</option>
                <option value="admin">Admin — can manage members</option>
              </select>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Create invite link
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
