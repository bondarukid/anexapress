import type { SkeletonProfileProps } from "@/components/skeletons/types";

/**
 * Kibo UI skeleton profile pattern presets.
 */
export const profilePresets = {
  userHeader: {
    variant: "userHeader",
  },
  profileCard: {
    variant: "profileCard",
  },
  settingsForm: {
    variant: "settingsForm",
  },
  withStats: {
    variant: "withStats",
  },
  teamMember: {
    variant: "teamMember",
  },
} satisfies Record<string, Partial<SkeletonProfileProps>>;
