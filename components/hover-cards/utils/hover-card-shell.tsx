"use client";

import type { ReactNode } from "react";

import type { BaseHoverCardProps } from "@/components/hover-cards/types/hover-card.types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type HoverCardShellProps = BaseHoverCardProps & {
  children: ReactNode;
  defaultContentWidth?: string;
};

/**
 * Shared HoverCard wrapper for all category components.
 */
export function HoverCardShell({
  trigger,
  open,
  onOpenChange,
  openDelay = 200,
  closeDelay = 100,
  side,
  align,
  contentClassName,
  triggerAsChild = false,
  defaultContentWidth = "w-64",
  children,
}: HoverCardShellProps) {
  return (
    <HoverCard open={open} onOpenChange={onOpenChange} openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger asChild={triggerAsChild}>{trigger}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        className={cn(defaultContentWidth, contentClassName)}
      >
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}
