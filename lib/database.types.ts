/**
 * Database types for the Cortex schema (db/migrations/0001_auth_workspaces.sql).
 * Hand-written to match the migration exactly; replace with
 * `supabase gen types typescript` output once the project is linked.
 */

export type WorkspaceRole = "owner" | "admin" | "member";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
};

type WorkspaceMemberRow = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
};

type WorkspaceInviteRow = {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: WorkspaceRow;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_members: {
        Row: WorkspaceMemberRow;
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Update: {
          workspace_id?: string;
          user_id?: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_invites: {
        Row: WorkspaceInviteRow;
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: WorkspaceRole;
          token?: string;
          invited_by: string;
          created_at?: string;
          expires_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: WorkspaceRole;
          token?: string;
          invited_by?: string;
          created_at?: string;
          expires_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_workspace_member: {
        Args: { ws_id: string };
        Returns: boolean;
      };
      is_workspace_admin: {
        Args: { ws_id: string };
        Returns: boolean;
      };
      shares_workspace_with: {
        Args: { other_user: string };
        Returns: boolean;
      };
      create_workspace: {
        Args: { workspace_name: string; workspace_slug: string };
        Returns: WorkspaceRow;
      };
      accept_workspace_invite: {
        Args: { invite_token: string };
        Returns: string;
      };
    };
    Enums: {
      workspace_role: WorkspaceRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = ProfileRow;
export type Workspace = WorkspaceRow;
export type WorkspaceMember = WorkspaceMemberRow;
export type WorkspaceInvite = WorkspaceInviteRow;
