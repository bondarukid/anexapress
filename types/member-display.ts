export type MemberViewMode = "list" | "grid";

export type MemberPresenceTone = "active" | "away" | "busy" | "offline";

export type MemberDisplayBadge = {
  id: string;
  label: string;
};

export type MemberDisplayPresence = {
  label: string;
  tone: MemberPresenceTone;
};

export type MemberDisplayItem = {
  id: string;
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  badges?: MemberDisplayBadge[];
  presence?: MemberDisplayPresence;
  verified?: boolean;
};
