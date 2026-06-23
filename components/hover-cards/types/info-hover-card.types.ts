import type { LucideIcon } from "lucide-react";

import type { BaseHoverCardProps } from "@/components/hover-cards/types/hover-card.types";

export type InfoHoverCardVariant =
  | "simpleInfo"
  | "withTitle"
  | "withIconAndBadge"
  | "warningInfo"
  | "technicalInfo";

export type InfoHoverCardProps = BaseHoverCardProps & {
  variant?: InfoHoverCardVariant;
  title?: string;
  description?: string;
  badgeLabel?: string;
  icon?: LucideIcon;
  method?: string;
  endpoint?: string;
  authNote?: string;
};
