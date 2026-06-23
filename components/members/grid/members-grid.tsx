"use client";

import type { ReactNode } from "react";

import { MemberGridCard } from "@/components/members/grid/member-grid-card";
import { membersViewLabels } from "@/lib/members/content";
import { cn } from "@/lib/utils";
import type { MemberDisplayItem } from "@/types/member-display";

const columnClassNames: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export type MembersGridProps = {
  items: MemberDisplayItem[];
  columns?: 2 | 3 | 4;
  renderCardFooter?: (item: MemberDisplayItem) => ReactNode;
  renderCardMenu?: (item: MemberDisplayItem) => ReactNode;
  emptyState?: ReactNode;
  className?: string;
};

export function MembersGrid({
  items,
  columns = 3,
  renderCardFooter,
  renderCardMenu,
  emptyState,
  className,
}: MembersGridProps) {
  if (items.length === 0) {
    return (
      <div className={cn("text-muted-foreground py-8 text-center text-sm", className)}>
        {emptyState ?? membersViewLabels.empty}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", columnClassNames[columns], className)}>
      {items.map((item) => (
        <MemberGridCard
          key={item.id}
          item={item}
          menu={renderCardMenu?.(item)}
          footer={renderCardFooter?.(item)}
        />
      ))}
    </div>
  );
}
