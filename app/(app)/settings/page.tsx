import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CopyButton } from "@/components/features/workspace/copy-button";
import { InviteMemberDialog } from "@/components/features/workspace/invite-member-dialog";
import { RevokeInviteButton } from "@/components/features/workspace/revoke-invite-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAppUrl } from "@/lib/constants";
import {
  getPendingInvites,
  getSessionContext,
  getWorkspaceMembers,
} from "@/server/queries";

export const metadata: Metadata = {
  title: "Settings",
};

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const roleStyles: Record<string, string> = {
  owner: "border-indigo-400/30 bg-indigo-500/10 text-indigo-300",
  admin: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  member: "border-white/10 bg-white/5 text-muted-foreground",
};

export default async function SettingsPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.activeWorkspace) redirect("/onboarding");

  const workspace = session.activeWorkspace;
  const isAdmin = workspace.role === "owner" || workspace.role === "admin";

  const [members, invites] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    isAdmin ? getPendingInvites(workspace.id) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage <span className="text-foreground">{workspace.name}</span> and
          its members.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Created {new Date(workspace.created_at).toLocaleDateString()} ·
            slug <span className="font-mono">{workspace.slug}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your role here:{" "}
            <Badge variant="outline" className={roleStyles[workspace.role]}>
              {workspace.role}
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "person" : "people"} in
              this workspace
            </CardDescription>
          </div>
          {isAdmin && <InviteMemberDialog workspaceId={workspace.id} />}
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5"
            >
              <Avatar className="size-8 border border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500/30 to-violet-600/30 text-xs font-medium">
                  {initials(member.fullName, member.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {member.fullName ?? member.email}
                  {member.userId === session.profile.id && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                {member.fullName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={roleStyles[member.role]}>
                {member.role}
              </Badge>
            </div>
          ))}

          {isAdmin && invites.length > 0 && (
            <>
              <Separator className="my-3 bg-white/10" />
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending invites
              </p>
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      expires{" "}
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={roleStyles[invite.role]}>
                    {invite.role}
                  </Badge>
                  <CopyButton
                    value={`${getAppUrl()}/invite/${invite.token}`}
                    label="Copy"
                  />
                  <RevokeInviteButton inviteId={invite.id} />
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
