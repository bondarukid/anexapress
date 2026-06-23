import { BadgeCheckIcon, PlusIcon } from "lucide-react";

import type { LayoutItemProps } from "@/components/items/types";

/**
 * Kibo UI layout item pattern presets.
 */
export const layoutPresets = {
  sizes: {
    variant: "sizes",
    items: [
      {
        id: "default-size",
        title: "Default Size Item",
        description: "A simple item with title and description.",
        itemVariant: "outline",
        className: "bg-background",
        action: {
          type: "button",
          label: "Action",
        },
      },
      {
        id: "small-size",
        title: "Small Size Item",
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
    ],
  },
  group: {
    variant: "group",
    items: [
      {
        id: "haydenbleasel",
        title: "haydenbleasel",
        description: "h****n@vercel.com",
        media: {
          type: "avatar",
          src: "https://github.com/haydenbleasel.png",
          fallback: "h",
        },
        action: {
          type: "icon",
          icon: PlusIcon,
          ariaLabel: "Add",
          variant: "ghost",
          size: "icon",
        },
      },
      {
        id: "shadcn",
        title: "shadcn",
        description: "s****n@vercel.com",
        media: {
          type: "avatar",
          src: "https://github.com/shadcn.png",
          fallback: "s",
        },
        action: {
          type: "icon",
          icon: PlusIcon,
          ariaLabel: "Add",
          variant: "ghost",
          size: "icon",
        },
      },
      {
        id: "rauchg",
        title: "rauchg",
        description: "r****g@vercel.com",
        media: {
          type: "avatar",
          src: "https://github.com/rauchg.png",
          fallback: "r",
        },
        action: {
          type: "icon",
          icon: PlusIcon,
          ariaLabel: "Add",
          variant: "ghost",
          size: "icon",
        },
      },
    ],
  },
  withHeader: {
    variant: "withHeader",
    items: [
      {
        id: "v0-1-5-sm",
        title: "v0-1.5-sm",
        description: "Everyday tasks and UI generation.",
        itemVariant: "outline",
        className: "bg-background",
        headerImage: {
          src: "https://placehold.co/640x480",
          alt: "v0-1.5-sm",
          width: 640,
          height: 480,
        },
      },
      {
        id: "v0-1-5-lg",
        title: "v0-1.5-lg",
        description: "Advanced thinking or reasoning.",
        itemVariant: "outline",
        className: "bg-background",
        headerImage: {
          src: "https://placehold.co/640x480",
          alt: "v0-1.5-lg",
          width: 640,
          height: 480,
        },
      },
      {
        id: "v0-2-0-mini",
        title: "v0-2.0-mini",
        description: "Open Source model for everyone.",
        itemVariant: "outline",
        className: "bg-background",
        headerImage: {
          src: "https://placehold.co/640x480",
          alt: "v0-2.0-mini",
          width: 640,
          height: 480,
        },
      },
    ],
  },
} satisfies Record<string, Partial<LayoutItemProps>>;
