export const JOIN_CODE_LENGTH = 8;

export type InviteKind = "email_invite" | "join_link";

export type InviteCreatedPayload = {
  joinCode: string;
  inviteUrl: string;
  expiresAt: string;
  inviteId?: string;
  joinLinkId?: string;
};

export type InviteActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type JoinWorkspaceByCodeResult = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  logoUrl: string | null;
  timezone: string;
  roleSlug: string;
  source: InviteKind;
};

export type InviteLandingContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  inviteKind: InviteKind;
  expiresAt: string;
  isValid: boolean;
};
