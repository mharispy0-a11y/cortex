import { cache } from "react";
import { cookies } from "next/headers";

import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/constants";
import type { Profile, Workspace, WorkspaceRole } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceWithRole = Workspace & { role: WorkspaceRole };

export type SessionContext = {
  profile: Profile;
  workspaces: WorkspaceWithRole[];
  activeWorkspace: WorkspaceWithRole | null;
};

/**
 * The signed-in user's profile, workspaces, and active workspace.
 * `cache()` deduplicates calls across layout + page within one request.
 * Returns null when signed out (middleware should prevent that on
 * protected routes, but never assume).
 */
export const getSessionContext = cache(
  async (): Promise<SessionContext | null> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile) return null;

    const { data: memberships } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id);

    const roleByWorkspace = new Map(
      (memberships ?? []).map((m) => [m.workspace_id, m.role])
    );

    let workspaces: WorkspaceWithRole[] = [];
    if (roleByWorkspace.size > 0) {
      const { data } = await supabase
        .from("workspaces")
        .select("*")
        .in("id", [...roleByWorkspace.keys()])
        .order("created_at", { ascending: true });
      workspaces = (data ?? []).map((w) => ({
        ...w,
        role: roleByWorkspace.get(w.id) ?? "member",
      }));
    }

    const cookieStore = await cookies();
    const requestedId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;
    // A forged/stale cookie falls through to the first workspace — and RLS
    // would return nothing for it anyway.
    const activeWorkspace =
      workspaces.find((w) => w.id === requestedId) ?? workspaces[0] ?? null;

    return { profile, workspaces, activeWorkspace };
  }
);

export type MemberWithProfile = {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  fullName: string | null;
  email: string;
};

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<MemberWithProfile[]> {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id, role, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (!members || members.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", members.map((m) => m.user_id));

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return members.map((m) => {
    const profile = profileById.get(m.user_id);
    return {
      userId: m.user_id,
      role: m.role,
      joinedAt: m.created_at,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? "unknown",
    };
  });
}

export async function getPendingInvites(workspaceId: string) {
  const supabase = await createClient();
  // RLS: only admins get rows back; members simply see an empty list.
  const { data } = await supabase
    .from("workspace_invites")
    .select("id, email, role, token, created_at, expires_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  return data ?? [];
}
