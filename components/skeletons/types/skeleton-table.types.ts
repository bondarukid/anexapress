import type {
  BaseSkeletonProps,
  SkeletonTableColumnProps,
} from "@/components/skeletons/types/skeleton.types";

export type SkeletonTableVariant =
  | "simpleRows"
  | "withActions"
  | "withAvatars"
  | "expandableRows"
  | "withPagination";

export type SkeletonTableProps = BaseSkeletonProps &
  SkeletonTableColumnProps & {
    variant?: SkeletonTableVariant;
  };
