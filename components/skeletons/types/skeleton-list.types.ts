import type {
  BaseSkeletonProps,
  SkeletonCountProps,
  SkeletonListTrailing,
} from "@/components/skeletons/types/skeleton.types";

export type SkeletonListVariant =
  | "simple"
  | "avatars"
  | "icons"
  | "multiLine"
  | "hierarchical";

export type SkeletonListProps = BaseSkeletonProps &
  SkeletonCountProps & {
    variant?: SkeletonListVariant;
    trailing?: SkeletonListTrailing;
    avatarClassName?: string;
    lineClassNames?: string[];
    trailingClassName?: string;
    itemClassName?: string;
  };
