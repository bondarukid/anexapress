import { z } from "zod";

export const NotificationKindSchema = z.enum([
  "workspace_invite",
  "workspace_transfer",
  "workspace_parent_attach",
  "system.invite_sent",
  "system.invite_revoked",
  "system.invite_revoked_invitee",
  "system.invite_accepted",
  "system.invite_declined",
]);
export type NotificationKind = z.infer<typeof NotificationKindSchema>;

export const NotificationIdSchema = z.object({
  notificationId: z.uuid(),
});

export const InviteIdSchema = z.object({
  inviteId: z.uuid(),
});
