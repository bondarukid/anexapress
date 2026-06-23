import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";

import type { ItemActionConfig } from "@/components/items/types/item.types";
import { Button } from "@/components/ui/button";
import { ItemActions } from "@/components/ui/item";
import { cn } from "@/lib/utils";

type RenderItemActionsProps = {
  action?: ItemActionConfig;
  className?: string;
};

/**
 * Renders button, icon, chevron, or external-link actions for an item row.
 */
export function RenderItemActions({ action, className }: RenderItemActionsProps) {
  if (!action) {
    return null;
  }

  if (action.type === "chevron") {
    return (
      <ItemActions className={className}>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    );
  }

  if (action.type === "externalLink") {
    return (
      <ItemActions className={className}>
        <ExternalLinkIcon className="size-4" />
      </ItemActions>
    );
  }

  if (action.type === "icon") {
    const Icon = action.icon;
    return (
      <ItemActions className={className}>
        <Button
          aria-label={action.ariaLabel}
          className={cn("rounded-full", action.className)}
          onClick={action.onClick}
          size={action.size ?? "icon"}
          type="button"
          variant={action.variant ?? "ghost"}
        >
          <Icon data-icon="inline-start" />
        </Button>
      </ItemActions>
    );
  }

  return (
    <ItemActions className={className}>
      <Button
        className={action.className}
        onClick={action.onClick}
        size={action.size ?? "sm"}
        type="button"
        variant={action.variant ?? "outline"}
      >
        {action.label}
      </Button>
    </ItemActions>
  );
}
