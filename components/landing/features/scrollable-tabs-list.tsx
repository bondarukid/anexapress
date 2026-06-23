"use client";

import type { ReactNode } from "react";

import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type ScrollableTabsListProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontally scrollable pill tab strip wrapper from shadcnblocks feature211.
 * Uses Radix ScrollArea directly so the horizontal scrollbar sits outside the viewport.
 */
export function ScrollableTabsList({ children, className }: ScrollableTabsListProps) {
  return (
    <div className={cn("overflow-hidden rounded-full", className)}>
      <ScrollAreaPrimitive.Root className="relative">
        <ScrollAreaPrimitive.Viewport className="size-full whitespace-nowrap">
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          orientation="horizontal"
          className="flex h-2 touch-none p-px transition-colors select-none"
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
      </ScrollAreaPrimitive.Root>
    </div>
  );
}
