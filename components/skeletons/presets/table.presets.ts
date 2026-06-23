import type { SkeletonTableProps } from "@/components/skeletons/types";

/**
 * Kibo UI skeleton table pattern presets.
 */
export const tablePresets = {
  simpleRows: {
    variant: "simpleRows",
    rowCount: 5,
    columnCount: 4,
  },
  withActions: {
    variant: "withActions",
    rowCount: 4,
    columnCount: 5,
  },
  withAvatars: {
    variant: "withAvatars",
    rowCount: 4,
    columnCount: 4,
  },
  expandableRows: {
    variant: "expandableRows",
  },
  withPagination: {
    variant: "withPagination",
    rowCount: 5,
    columnCount: 4,
  },
} satisfies Record<string, Partial<SkeletonTableProps>>;
