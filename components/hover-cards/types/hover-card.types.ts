import type { ReactNode } from "react";

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

/**
 * Shared props for all Kibo UI hover-card category components.
 */
export type BaseHoverCardProps = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  side?: HoverCardSide;
  align?: HoverCardAlign;
  contentClassName?: string;
  triggerAsChild?: boolean;
};

export type StatItem = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  sublabel?: string;
};

export type PreviewMetaItem = {
  label: string;
  value: string;
};

export type ProfileStatItem = {
  label: string;
  value: string | number;
};

export type TrendDirection = "up" | "down" | "neutral";
