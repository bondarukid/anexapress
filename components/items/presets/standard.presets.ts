import { BadgeCheckIcon } from "lucide-react";

import type { StandardItemProps } from "@/components/items/types";

/**
 * Kibo UI standard item pattern presets.
 */
export const standardPresets = {
  basic: {
    variant: "basic",
    title: "Basic Item",
    description: "A simple item with title and description.",
    itemVariant: "outline",
    className: "bg-background",
    action: {
      type: "button",
      label: "Action",
    },
  },
  mediaAndIcon: {
    variant: "mediaAndIcon",
    title: "Your profile has been verified.",
    href: "#",
    size: "sm",
    itemVariant: "outline",
    className: "bg-background",
    media: {
      type: "icon",
      icon: BadgeCheckIcon,
      iconClassName: "size-5",
    },
    action: {
      type: "chevron",
    },
  },
} satisfies Record<string, Partial<StandardItemProps>>;
