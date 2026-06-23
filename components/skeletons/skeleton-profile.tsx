import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonProfileProps } from "@/components/skeletons/types";
import { SkeletonFieldBlock } from "@/components/skeletons/utils/skeleton-blocks";
import { cn } from "@/lib/utils";

/**
 * Configurable skeleton profile covering Kibo UI skeleton-profile-1…5.
 * https://www.kibo-ui.com/patterns/skeleton/profile
 */
export function SkeletonProfile({
  variant = "userHeader",
  className,
  containerClassName,
}: SkeletonProfileProps) {
  if (variant === "userHeader") {
    return (
      <div
        className={cn(
          "flex w-full max-w-md flex-col items-center gap-4 rounded-md border p-6",
          containerClassName,
          className,
        )}
      >
        <Skeleton className="size-24 rounded-full" />
        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex w-full justify-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    );
  }

  if (variant === "profileCard") {
    return (
      <div
        className={cn(
          "flex w-full max-w-sm flex-col gap-4 rounded-md border p-6",
          containerClassName,
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-4 border-t pt-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={index}>
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "settingsForm") {
    return (
      <div
        className={cn("flex w-full max-w-md flex-col gap-6", containerClassName, className)}
      >
        <SkeletonFieldBlock labelClassName="h-4 w-20" />
        <SkeletonFieldBlock labelClassName="h-4 w-24" />
        <SkeletonFieldBlock labelClassName="h-4 w-16" />
        <SkeletonFieldBlock inputClassName="h-24 w-full" labelClassName="h-4 w-28" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (variant === "withStats") {
    return (
      <div
        className={cn(
          "flex w-full max-w-md flex-col gap-6 rounded-md border p-6",
          containerClassName,
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="flex flex-col items-center gap-2 rounded-md border p-3"
              key={index}
            >
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-xs flex-col items-center gap-4 rounded-md border p-6 text-center",
        containerClassName,
        className,
      )}
    >
      <Skeleton className="size-20 rounded-full" />
      <div className="flex w-full flex-col items-center gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}
