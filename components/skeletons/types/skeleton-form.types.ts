import type { BaseSkeletonProps } from "@/components/skeletons/types/skeleton.types";

export type SkeletonFormVariant =
  | "inputFields"
  | "withLabels"
  | "multiColumn"
  | "withSections"
  | "searchForm";

export type SkeletonFormProps = BaseSkeletonProps & {
  variant?: SkeletonFormVariant;
};
