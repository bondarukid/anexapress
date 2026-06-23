export function mapJoinByCodeError(message: string): string {
  if (message.includes("join_code_invalid")) {
    return "Enter a valid 8-character join code.";
  }
  if (message.includes("join_code_not_found")) {
    return "Join code not found. Check the code and try again.";
  }
  if (message.includes("join_link_not_active")) {
    return "This join link is no longer active.";
  }
  if (message.includes("join_link_expired")) {
    return "This join link has expired.";
  }
  if (message.includes("invite_not_found")) {
    return "Invitation not found.";
  }
  if (message.includes("invite_not_pending")) {
    return "This invitation is no longer available.";
  }
  if (message.includes("invite_expired")) {
    return "This invitation has expired.";
  }
  if (message.includes("invite_email_mismatch")) {
    return "This code was issued for a different email address.";
  }
  if (message.includes("already_member")) {
    return "You are already a member of this workspace.";
  }
  if (message.includes("unauthorized")) {
    return "Session expired. Please sign in again.";
  }
  if (message.includes("forbidden")) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("expires_at_invalid")) {
    return "Expiration date must be in the future.";
  }
  if (message.includes("role_not_available")) {
    return "Selected role is not available.";
  }
  return message;
}
