"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACTIVE_WORKSPACE_COOKIE, getAppUrl, workspaceSlug } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  type CreateWorkspaceValues,
  type InviteMemberValues,
} from "@/lib/validation/workspace";
import type { ActionResult } from "@/server/actions/auth";

async function setActiveWorkspaceCookie(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function createWorkspace(
  values: CreateWorkspaceValues
): Promise<ActionResult> {
  const parsed = createWorkspaceSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the name." };
  }

  const supabase = await createClient();

  // SECURITY DEFINER RPC: inserts workspace + owner membership in one
  // transaction and returns the row — see migration 0001 for why a plain
  // .insert().select() can come back empty here.
  const { data: workspace, error } = await supabase.rpc("create_workspace", {
    workspace_name: parsed.data.name,
    workspace_slug: workspaceSlug(parsed.data.name),
  });

  if (error || !workspace) {
    return { error: "Could not create the workspace. Please try again." };
  }

  await setActiveWorkspaceCookie(workspace.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function setActiveWorkspace(
  workspaceId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  // RLS makes this query the membership check: non-members get zero rows.
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!workspace) {
    return { error: "You don't have access to that workspace." };
  }

  await setActiveWorkspaceCookie(workspace.id);
  revalidatePath("/", "layout");
  return {};
}

export type InviteResult = ActionResult & { inviteLink?: string };

export async function inviteMember(
  workspaceId: string,
  values: InviteMemberValues
): Promise<InviteResult> {
  const parsed = inviteMemberSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the email." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const { data: invite, error } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspaceId,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error) {
    // Partial unique index on (workspace_id, lower(email)) where pending
    if (error.code === "23505") {
      return { error: "That email already has a pending invite." };
    }
    return { error: "Could not create the invite. Are you an admin here?" };
  }

  revalidatePath("/settings");
  return { inviteLink: `${getAppUrl()}/invite/${invite.token}` };
}

export async function revokeInvite(inviteId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId);

  if (error) {
    return { error: "Could not revoke the invite." };
  }

  revalidatePath("/settings");
  return {};
}

export async function acceptInvite(token: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: workspaceId, error } = await supabase.rpc(
    "accept_workspace_invite",
    { invite_token: token }
  );

  if (error || !workspaceId) {
    if (error?.message.includes("invite_email_mismatch")) {
      return {
        error:
          "This invite was issued to a different email address. Sign in with the invited account.",
      };
    }
    return { error: "This invite is invalid, expired, or already used." };
  }

  await setActiveWorkspaceCookie(workspaceId);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
