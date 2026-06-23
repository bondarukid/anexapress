import type { SkeletonListProps } from "@/components/skeletons/types";

/**
 * Kibo UI skeleton list pattern presets.
 */
export const listPresets = {
  simple: {
    variant: "simple",
    count: 5,
  },
  avatars: {
    variant: "avatars",
    count: 4,
  },
  icons: {
    variant: "icons",
    count: 5,
  },
  multiLine: {
    variant: "multiLine",
    count: 3,
  },
  hierarchical: {
    variant: "hierarchical",
  },
  teamMemberRow: {
    variant: "avatars",
    count: 1,
    trailing: "button",
    avatarClassName: "size-9.5 shrink-0 rounded-full",
    lineClassNames: ["h-4 w-[150px]", "h-3 w-[100px]"],
    trailingClassName: "h-8 w-30 shrink-0 rounded-md",
    containerClassName: "max-w-none gap-0",
    itemClassName: "py-1",
  },
} satisfies Record<string, Partial<SkeletonListProps>>;
