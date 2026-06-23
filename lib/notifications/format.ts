/** Invitee inbox: who invited them (not workspace name — avoids "Invitation to Ivan…" confusion). */
export function inviteNotificationTitle(inviterName: string): string {
  return `${inviterName} invited you`;
}

export function inviteNotificationBody(inviterName: string, workspaceName: string): string {
  return `${inviterName} invited you to join ${workspaceName}.`;
}

export function inviteRevokedInviteeBody(inviterName: string, workspaceName: string): string {
  return `${inviterName} withdrew your invitation to join ${workspaceName}.`;
}

export function formatInviterName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "A team member";
}
