import type { BaseHoverCardProps, ProfileStatItem } from "@/components/hover-cards/types/hover-card.types";

export type ProfileHoverCardVariant =
  | "simpleProfile"
  | "withFollowButton"
  | "withBadge"
  | "withLocation"
  | "withStats";

export type ProfileHoverCardProps = BaseHoverCardProps & {
  variant?: ProfileHoverCardVariant;
  name: string;
  username?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  bio?: string;
  location?: string;
  joinedAt?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  stats?: ProfileStatItem[];
  followLabel?: string;
  followingLabel?: string;
  isFollowing?: boolean;
  onFollow?: () => void;
  messageLabel?: string;
  onMessage?: () => void;
};
