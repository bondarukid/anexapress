import type { InteractiveItemProps } from "@/components/items/types";

/**
 * Kibo UI interactive item pattern presets.
 */
export const interactivePresets = {
  link: {
    variant: "link",
    title: "Visit our documentation",
    description: "Learn how to get started with our components.",
    href: "#",
    action: {
      type: "chevron",
    },
  },
  linkExternal: {
    variant: "linkExternal",
    title: "External resource",
    description: "Opens in a new tab with security attributes.",
    href: "#",
    itemVariant: "outline",
    className: "bg-background",
    action: {
      type: "externalLink",
    },
  },
  dropdown: {
    variant: "dropdown",
    triggerLabel: "Select",
    dropdownItems: [
      {
        id: "haydenbleasel",
        title: "haydenbleasel",
        description: "h****n@vercel.com",
        media: {
          type: "avatar",
          src: "https://github.com/haydenbleasel.png",
          fallback: "h",
          className: "size-8",
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
          className: "size-8",
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
          className: "size-8",
        },
      },
    ],
  },
} satisfies Record<string, Partial<InteractiveItemProps>>;
