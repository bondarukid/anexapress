import type { SkeletonCardProps } from "@/components/skeletons/types";

/**
 * Kibo UI skeleton card pattern presets.
 */
export const cardPresets = {
  simpleImageText: {
    variant: "simpleImageText",
  },
  avatarContent: {
    variant: "avatarContent",
  },
  badgeTags: {
    variant: "badgeTags",
  },
  vertical: {
    variant: "vertical",
  },
  horizontal: {
    variant: "horizontal",
  },
} satisfies Record<string, Partial<SkeletonCardProps>>;
