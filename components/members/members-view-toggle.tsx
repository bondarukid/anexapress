"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { membersViewLabels } from "@/lib/members/content";
import type { MemberViewMode } from "@/types/member-display";

export type MembersViewToggleProps = {
  value: MemberViewMode;
  onValueChange: (value: MemberViewMode) => void;
  disabled?: boolean;
  className?: string;
};

export function MembersViewToggle({
  value,
  onValueChange,
  disabled = false,
  className,
}: MembersViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={0}
      value={value}
      disabled={disabled}
      className={className}
      onValueChange={(next) => {
        if (next === "list" || next === "grid") {
          onValueChange(next);
        }
      }}
    >
      <ToggleGroupItem value="list" aria-label={membersViewLabels.list}>
        <ListIcon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label={membersViewLabels.grid}>
        <LayoutGridIcon className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
