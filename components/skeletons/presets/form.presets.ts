import type { SkeletonFormProps } from "@/components/skeletons/types";

/**
 * Kibo UI skeleton form pattern presets.
 */
export const formPresets = {
  inputFields: {
    variant: "inputFields",
  },
  withLabels: {
    variant: "withLabels",
  },
  multiColumn: {
    variant: "multiColumn",
  },
  withSections: {
    variant: "withSections",
  },
  searchForm: {
    variant: "searchForm",
  },
} satisfies Record<string, Partial<SkeletonFormProps>>;
