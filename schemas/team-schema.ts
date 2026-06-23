import { z } from "zod";

export const WorkspaceIdSchema = z.object({
  workspaceId: z.uuid(),
});

export const InviteMemberSchema = z.object({
  workspaceId: z.uuid(),
  email: z.email("Enter a valid email address."),
  roleId: z.uuid(),
});

export const UpdateMemberRoleSchema = z.object({
  workspaceId: z.uuid(),
  membershipId: z.uuid(),
  roleId: z.uuid(),
});

export const RemoveMemberSchema = z.object({
  workspaceId: z.uuid(),
  membershipId: z.uuid(),
});

export const LeaveWorkspaceSchema = z.object({
  workspaceId: z.uuid(),
});

export const InitiateWorkspaceTransferSchema = z.object({
  workspaceId: z.uuid(),
  toUserId: z.uuid(),
  workspaceSlug: z.string().optional(),
});

export const WorkspaceTransferIdSchema = z.object({
  transferId: z.uuid(),
  workspaceSlug: z.string().optional(),
});

export const RevokeInviteSchema = z.object({
  workspaceId: z.uuid(),
  inviteId: z.uuid(),
});

export const UpdatePendingInviteRoleSchema = z.object({
  workspaceId: z.uuid(),
  inviteId: z.uuid(),
  roleId: z.uuid(),
});
