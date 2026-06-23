import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonFormProps } from "@/components/skeletons/types";
import { SkeletonFieldBlock } from "@/components/skeletons/utils/skeleton-blocks";
import { cn } from "@/lib/utils";

/**
 * Configurable skeleton form covering Kibo UI skeleton-form-1…5.
 * https://www.kibo-ui.com/patterns/skeleton/form
 */
export function SkeletonForm({
  variant = "inputFields",
  className,
  containerClassName,
}: SkeletonFormProps) {
  if (variant === "inputFields") {
    return (
      <div
        className={cn("flex w-full max-w-md flex-col gap-4", containerClassName, className)}
      >
        <SkeletonFieldBlock labelClassName="h-4 w-16" />
        <SkeletonFieldBlock labelClassName="h-4 w-20" />
        <SkeletonFieldBlock labelClassName="h-4 w-24" />
      </div>
    );
  }

  if (variant === "withLabels") {
    return (
      <div
        className={cn(
          "flex w-full max-w-md flex-col gap-6 rounded-md border p-6",
          containerClassName,
          className,
        )}
      >
        <SkeletonFieldBlock
          labelClassName="h-5 w-24"
          showDescription
          descriptionClassName="h-3 w-48"
        />
        <SkeletonFieldBlock labelClassName="h-4 w-20" />
        <SkeletonFieldBlock labelClassName="h-4 w-24" />
        <SkeletonFieldBlock inputClassName="h-24 w-full" labelClassName="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (variant === "multiColumn") {
    return (
      <div
        className={cn("flex w-full max-w-2xl flex-col gap-6", containerClassName, className)}
      >
        <div className="grid grid-cols-2 gap-4">
          <SkeletonFieldBlock labelClassName="h-4 w-20" />
          <SkeletonFieldBlock labelClassName="h-4 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonFieldBlock labelClassName="h-4 w-16" />
          <SkeletonFieldBlock labelClassName="h-4 w-20" />
        </div>
        <SkeletonFieldBlock labelClassName="h-4 w-16" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (variant === "withSections") {
    return (
      <div
        className={cn("flex w-full max-w-lg flex-col gap-8", containerClassName, className)}
      >
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex flex-col gap-4 border-l-2 pl-4">
            <SkeletonFieldBlock labelClassName="h-4 w-20" />
            <SkeletonFieldBlock labelClassName="h-4 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col gap-4 border-l-2 pl-4">
            <SkeletonFieldBlock labelClassName="h-4 w-16" />
            <SkeletonFieldBlock inputClassName="h-24 w-full" labelClassName="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-4", containerClassName, className)}
    >
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
