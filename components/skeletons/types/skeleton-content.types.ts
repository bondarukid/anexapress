import type {
  BaseSkeletonProps,
  SkeletonCountProps,
} from "@/components/skeletons/types/skeleton.types";

export type SkeletonContentVariant =
  | "articlePreview"
  | "blogPost"
  | "commentThread"
  | "detailedArticle"
  | "withSidebar";

export type SkeletonContentProps = BaseSkeletonProps &
  SkeletonCountProps & {
    variant?: SkeletonContentVariant;
  };
