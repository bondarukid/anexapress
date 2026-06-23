import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonContentProps } from "@/components/skeletons/types";
import { SkeletonAvatarBlock } from "@/components/skeletons/utils/skeleton-blocks";
import { SkeletonRepeat } from "@/components/skeletons/utils/skeleton-repeat";
import { cn } from "@/lib/utils";

/**
 * Configurable skeleton content covering Kibo UI skeleton-content-1…5.
 * https://www.kibo-ui.com/patterns/skeleton/content
 */
export function SkeletonContent({
  variant = "articlePreview",
  count = 3,
  className,
  containerClassName,
}: SkeletonContentProps) {
  if (variant === "articlePreview") {
    return (
      <div
        className={cn(
          "flex w-full max-w-2xl flex-col gap-4 rounded-md border p-6",
          containerClassName,
          className,
        )}
      >
        <SkeletonAvatarBlock
          avatarClassName="size-10 shrink-0 rounded-full"
          lineClassNames={["h-4 w-24", "h-3 w-32"]}
        />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === "blogPost") {
    return (
      <div
        className={cn("flex w-full max-w-3xl flex-col gap-6", containerClassName, className)}
      >
        <Skeleton className="h-10 w-3/4" />
        <SkeletonAvatarBlock
          avatarClassName="size-12 shrink-0 rounded-full"
          lineClassNames={["h-4 w-32", "h-3 w-40"]}
        />
        <Skeleton className="h-64 w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (variant === "commentThread") {
    return (
      <div
        className={cn("flex w-full max-w-2xl flex-col gap-4", containerClassName, className)}
      >
        <SkeletonRepeat
          count={count}
          renderItem={() => (
            <div className="flex gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    );
  }

  if (variant === "detailedArticle") {
    return (
      <div
        className={cn("flex w-full max-w-3xl flex-col gap-8", containerClassName, className)}
      >
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-96 w-full" />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full max-w-5xl grid-cols-3 gap-8",
        containerClassName,
        className,
      )}
    >
      <div className="col-span-2 flex flex-col gap-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <Skeleton className="h-5 w-32" />
          <SkeletonRepeat
            count={4}
            renderItem={() => (
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="h-4 flex-1" />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
