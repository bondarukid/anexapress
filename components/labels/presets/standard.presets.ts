import type { StandardLabelProps } from "@/components/labels/types";

/**
 * Kibo UI standard label pattern presets.
 */
export const standardLabelPresets = {
  standard: {
    variant: "standard",
  },
  required: {
    variant: "required",
  },
  withDescription: {
    variant: "description",
    description: "This will be your public display name",
  },
  withTooltip: {
    variant: "tooltip",
    tooltip: "Your secret API key for authentication",
  },
  withBadge: {
    variant: "badge",
    badge: "Beta",
  },
  optional: {
    variant: "optional",
  },
  characterCount: {
    variant: "characterCount",
    currentCount: 0,
    maxCount: 500,
  },
  error: {
    variant: "error",
    errorMessage: "Password is too weak",
  },
  section: {
    variant: "section",
  },
} satisfies Record<string, Partial<StandardLabelProps>>;
