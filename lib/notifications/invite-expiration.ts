import { format } from "date-fns";

export function formatInviteExpirationText(expiresAt: string | null | undefined): string {
  if (!expiresAt) {
    return "This invitation expires in 14 days.";
  }

  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) {
    return "This invitation expires soon.";
  }

  return `This invitation expires on ${format(expires, "PPP")}.`;
}
