import type { BaseSkeletonProps } from "@/components/skeletons/types/skeleton.types";

export type SkeletonCardVariant =
  | "simpleImageText"
  | "avatarContent"
  | "badgeTags"
  | "vertical"
  | "horizontal";

export type SkeletonCardProps = BaseSkeletonProps & {
  variant?: SkeletonCardVariant;
};
