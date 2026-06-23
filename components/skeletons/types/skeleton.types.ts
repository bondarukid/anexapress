/**
 * Shared props for all Kibo UI skeleton category components.
 */
export type BaseSkeletonProps = {
  className?: string;
  containerClassName?: string;
};

export type SkeletonCountProps = {
  count?: number;
};

export type SkeletonTableColumnProps = {
  rowCount?: number;
  columnCount?: number;
};

export type SkeletonListTrailing = "none" | "button";
