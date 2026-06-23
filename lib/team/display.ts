import { formatWorkspaceRoleSlug } from "@/lib/ui/workspace-roles";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMemberDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || nameFromEmail(email);
}

export function formatRoleLabel(roleSlug: string, roleName?: string | null): string {
  if (roleName?.trim()) return roleName;
  return formatWorkspaceRoleSlug(roleSlug);
}
