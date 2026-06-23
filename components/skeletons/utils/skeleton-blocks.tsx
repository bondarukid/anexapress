import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonAvatarBlockProps = {
  avatarClassName?: string;
  className?: string;
  lineClassNames?: string[];
};

/**
 * Avatar circle with optional text lines — used in cards, lists, and tables.
 */
export function SkeletonAvatarBlock({
  avatarClassName = "size-10 shrink-0 rounded-full",
  className,
  lineClassNames = ["h-4 w-3/4", "h-3 w-1/2"],
}: SkeletonAvatarBlockProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Skeleton className={avatarClassName} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {lineClassNames.map((lineClassName, index) => (
          <Skeleton className={lineClassName} key={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * Backward-compatible alias matching the previous shared SkeletonAvatar API.
 */
export function SkeletonAvatar() {
  return (
    <SkeletonAvatarBlock
      avatarClassName="size-9.5 shrink-0 rounded-full"
      className="w-fit min-w-0 shrink-0"
      lineClassNames={["h-4 w-[150px]", "h-3 w-[100px]"]}
    />
  );
}

type SkeletonTextBlockProps = {
  className?: string;
  lineClassNames: string[];
};

export function SkeletonTextBlock({ className, lineClassNames }: SkeletonTextBlockProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {lineClassNames.map((lineClassName, index) => (
        <Skeleton className={lineClassName} key={index} />
      ))}
    </div>
  );
}

type SkeletonFieldBlockProps = {
  className?: string;
  descriptionClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  showDescription?: boolean;
};

export function SkeletonFieldBlock({
  className,
  descriptionClassName = "h-3 w-48",
  inputClassName = "h-10 w-full",
  labelClassName = "h-4 w-20",
  showDescription = false,
}: SkeletonFieldBlockProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Skeleton className={labelClassName} />
      {showDescription ? <Skeleton className={descriptionClassName} /> : null}
      <Skeleton className={inputClassName} />
    </div>
  );
}

type SkeletonTableHeaderProps = {
  className?: string;
  columnClassNames: string[];
};

export function SkeletonTableHeader({ className, columnClassNames }: SkeletonTableHeaderProps) {
  return (
    <div
      className={cn("grid gap-4 border-b pb-3", className)}
      style={{ gridTemplateColumns: `repeat(${columnClassNames.length}, minmax(0, 1fr))` }}
    >
      {columnClassNames.map((columnClassName, index) => (
        <Skeleton className={columnClassName} key={index} />
      ))}
    </div>
  );
}

type SkeletonTableRowProps = {
  className?: string;
  columnClassNames: string[];
  children?: ReactNode;
};

export function SkeletonTableRow({
  className,
  columnClassNames,
  children,
}: SkeletonTableRowProps) {
  return (
    <div
      className={cn("grid items-center gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columnClassNames.length}, minmax(0, 1fr))` }}
    >
      {children ??
        columnClassNames.map((columnClassName, index) => (
          <Skeleton className={columnClassName} key={index} />
        ))}
    </div>
  );
}
