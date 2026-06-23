export type { TeamActiveMember as ActiveMember } from "@/types/team";
export type { TeamPendingInvite as PendingInvite } from "@/types/team";

export type InvitePayload = {
  email: string;
  roleId: string;
};
