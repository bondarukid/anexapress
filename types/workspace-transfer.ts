export type WorkspaceTransferKind = "ownership" | "parent_attach";

export type WorkspaceTransferSummary = {
  transferId: string;
  toUserId: string;
  recipientConfirmedAt: string | null;
  status: string;
};

export type ParentAttachAcceptor = {
  userId: string;
  email: string;
  displayName: string;
  roleSlug: string;
  roleLabel: string;
  isOwner: boolean;
  avatarUrl: string | null;
};

export type WorkspaceParentAttachSummary = {
  transferId: string;
  sourceWorkspaceId: string;
  sourceWorkspaceName: string;
  sourceWorkspaceSlug: string;
  parentWorkspaceId: string;
  acceptorUserId: string;
  acceptorDisplayName: string;
  recipientConfirmedAt: string | null;
  status: string;
};
