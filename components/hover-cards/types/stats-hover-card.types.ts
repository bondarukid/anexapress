import type { LucideIcon } from "lucide-react";

import type {
  BaseHoverCardProps,
  StatItem,
  TrendDirection,
} from "@/components/hover-cards/types/hover-card.types";

export type StatsHoverCardVariant =
  | "simpleStats"
  | "growthStats"
  | "userStats"
  | "performanceStats"
  | "financialStats";

export type PerformanceStatItem = StatItem & {
  percentage?: number;
};

export type StatsHoverCardProps = BaseHoverCardProps & {
  variant?: StatsHoverCardVariant;
  primaryLabel?: string;
  primaryValue?: string | number;
  icon?: LucideIcon;
  statItems?: StatItem[];
  performanceItems?: PerformanceStatItem[];
  trend?: string;
  trendDirection?: TrendDirection;
  currency?: string;
  breakdown?: StatItem[];
};
