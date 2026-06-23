import type { SkeletonContentProps } from "@/components/skeletons/types";

/**
 * Kibo UI skeleton content pattern presets.
 */
export const contentPresets = {
  articlePreview: {
    variant: "articlePreview",
  },
  blogPost: {
    variant: "blogPost",
  },
  commentThread: {
    variant: "commentThread",
    count: 3,
  },
  detailedArticle: {
    variant: "detailedArticle",
  },
  withSidebar: {
    variant: "withSidebar",
  },
} satisfies Record<string, Partial<SkeletonContentProps>>;
