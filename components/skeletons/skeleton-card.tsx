import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonCardProps } from "@/components/skeletons/types";
import { SkeletonAvatarBlock } from "@/components/skeletons/utils/skeleton-blocks";
import { cn } from "@/lib/utils";

/**
 * Configurable skeleton card covering Kibo UI skeleton-card-1…5.
 * https://www.kibo-ui.com/patterns/skeleton/card
 */
export function SkeletonCard({
  variant = "simpleImageText",
  className,
  containerClassName,
}: SkeletonCardProps) {
  if (variant === "simpleImageText") {
    return (
      <div
        className={cn("flex w-full max-w-sm flex-col gap-3", containerClassName, className)}
      >
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (variant === "avatarContent") {
    return (
      <div
        className={cn(
          "flex w-full max-w-sm flex-col gap-3 rounded-md border p-4",
          containerClassName,
          className,
        )}
      >
        <SkeletonAvatarBlock
          avatarClassName="size-12 shrink-0 rounded-full"
          lineClassNames={["h-4 w-24", "h-3 w-32"]}
        />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (variant === "badgeTags") {
    return (
      <div
        className={cn(
          "flex w-full max-w-sm flex-col gap-3 rounded-md border p-4",
          containerClassName,
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div
        className={cn(
          "flex w-full max-w-sm flex-col gap-3 overflow-hidden rounded-md border",
          containerClassName,
          className,
        )}
      >
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="mt-2 flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-lg gap-4 rounded-md border p-4",
        containerClassName,
        className,
      )}
    >
      <Skeleton className="h-24 w-24 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}
