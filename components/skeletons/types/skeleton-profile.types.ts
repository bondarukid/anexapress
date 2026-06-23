import type { BaseSkeletonProps } from "@/components/skeletons/types/skeleton.types";

export type SkeletonProfileVariant =
  | "userHeader"
  | "profileCard"
  | "settingsForm"
  | "withStats"
  | "teamMember";

export type SkeletonProfileProps = BaseSkeletonProps & {
  variant?: SkeletonProfileVariant;
};
