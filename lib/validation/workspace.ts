import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your workspace a name")
    .max(80, "Keep it under 80 characters"),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["admin", "member"]), // 'owner' is never grantable via invite
});

export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
