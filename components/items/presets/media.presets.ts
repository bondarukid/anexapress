import { Plus, ShieldAlertIcon } from "lucide-react";

import type { MediaItemProps } from "@/components/items/types";

/**
 * Kibo UI media item pattern presets.
 */
export const mediaPresets = {
  iconMedia: {
    variant: "iconMedia",
    title: "Security Alert",
    description: "New login detected from unknown device.",
    itemVariant: "outline",
    className: "bg-background",
    media: {
      type: "icon",
      icon: ShieldAlertIcon,
      variant: "icon",
    },
    action: {
      type: "button",
      label: "Review",
    },
  },
  avatarMedia: {
    variant: "avatarMedia",
    title: "Hayden Bleasel",
    description: "Last seen 5 months ago",
    itemVariant: "outline",
    className: "bg-background",
    media: {
      type: "avatar",
      src: "https://github.com/haydenbleasel.png",
      fallback: "HB",
    },
    action: {
      type: "icon",
      icon: Plus,
      ariaLabel: "Invite",
      variant: "outline",
      size: "sm",
    },
  },
  imageMedia: {
    variant: "imageMedia",
    items: [
      {
        id: "midnight-city-lights",
        title: "Midnight City Lights - Electric Nights",
        description: "Neon Dreams",
        href: "#",
        trailingContent: { description: "3:45" },
        media: {
          type: "image",
          src: "https://placehold.co/32x32",
          alt: "Midnight City Lights",
          className: "object-cover grayscale",
          width: 32,
          height: 32,
        },
      },
      {
        id: "coffee-shop-conversations",
        title: "Coffee Shop Conversations - Urban Stories",
        description: "The Morning Brew",
        href: "#",
        trailingContent: { description: "4:05" },
        media: {
          type: "image",
          src: "https://placehold.co/32x32",
          alt: "Coffee Shop Conversations",
          className: "object-cover grayscale",
          width: 32,
          height: 32,
        },
      },
      {
        id: "digital-rain",
        title: "Digital Rain - Binary Beats",
        description: "Cyber Symphony",
        href: "#",
        trailingContent: { description: "3:30" },
        media: {
          type: "image",
          src: "https://placehold.co/32x32",
          alt: "Digital Rain",
          className: "object-cover grayscale",
          width: 32,
          height: 32,
        },
      },
    ],
  },
} satisfies Record<string, Partial<MediaItemProps>>;
