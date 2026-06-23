import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonListProps } from "@/components/skeletons/types";
import { SkeletonAvatarBlock } from "@/components/skeletons/utils/skeleton-blocks";
import { SkeletonRepeat } from "@/components/skeletons/utils/skeleton-repeat";
import { cn } from "@/lib/utils";

/**
 * Configurable skeleton list covering Kibo UI skeleton-list-1…5.
 * https://www.kibo-ui.com/patterns/skeleton/list
 */
export function SkeletonList({
  variant = "simple",
  count = 5,
  trailing = "none",
  avatarClassName = "size-10 shrink-0 rounded-full",
  lineClassNames = ["h-4 w-3/4", "h-3 w-1/2"],
  trailingClassName = "h-8 w-30 shrink-0 rounded-md",
  itemClassName,
  className,
  containerClassName,
}: SkeletonListProps) {
  if (variant === "simple") {
    return (
      <div
        className={cn("flex w-full max-w-md flex-col gap-3", containerClassName, className)}
      >
        <SkeletonRepeat
          count={count}
          renderItem={() => (
            <div className="flex items-center gap-3">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 flex-1" />
            </div>
          )}
        />
      </div>
    );
  }

  if (variant === "avatars") {
    return (
      <div
        className={cn("flex w-full max-w-md flex-col gap-4", containerClassName, className)}
      >
        <SkeletonRepeat
          count={count}
          renderItem={() => (
            <div
              className={cn(
                "flex w-full min-w-0 items-center justify-between gap-3",
                itemClassName,
              )}
            >
              <SkeletonAvatarBlock
                avatarClassName={avatarClassName}
                className="min-w-0 flex-1"
                lineClassNames={lineClassNames}
              />
              {trailing === "button" ? (
                <Skeleton className={trailingClassName} />
              ) : null}
            </div>
          )}
        />
      </div>
    );
  }

  if (variant === "icons") {
    return (
      <div
        className={cn("flex w-full max-w-md flex-col gap-3", containerClassName, className)}
      >
        <SkeletonRepeat
          count={count}
          renderItem={() => (
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="size-8 shrink-0 rounded-md" />
            </div>
          )}
        />
      </div>
    );
  }

  if (variant === "multiLine") {
    return (
      <div
        className={cn("flex w-full max-w-md flex-col gap-4", containerClassName, className)}
      >
        <SkeletonRepeat
          count={count}
          renderItem={() => (
            <div className="flex flex-col gap-2 rounded-md border p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="mt-2 flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-3", containerClassName, className)}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="flex items-center gap-3 pl-6">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="flex items-center gap-3 pl-6">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="flex items-center gap-3 pl-6">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 flex-1" />
      </div>
    </div>
  );
}
