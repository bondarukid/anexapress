import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonTableProps } from "@/components/skeletons/types";
import {
  SkeletonTableHeader,
  SkeletonTableRow,
} from "@/components/skeletons/utils/skeleton-blocks";
import { SkeletonRepeat } from "@/components/skeletons/utils/skeleton-repeat";
import { cn } from "@/lib/utils";

const DEFAULT_HEADER_WIDTHS = ["h-4 w-20", "h-4 w-24", "h-4 w-16", "h-4 w-20"];
const DEFAULT_CELL_CLASS = "h-4 w-full";

function buildColumnClasses(columnCount: number, widths = DEFAULT_HEADER_WIDTHS) {
  return Array.from({ length: columnCount }, (_, index) => widths[index] ?? DEFAULT_CELL_CLASS);
}

/**
 * Configurable skeleton table covering Kibo UI skeleton-table-1…5.
 * https://www.kibo-ui.com/patterns/skeleton/table
 */
export function SkeletonTable({
  variant = "simpleRows",
  rowCount = 5,
  columnCount = 4,
  className,
  containerClassName,
}: SkeletonTableProps) {
  const headerColumns = buildColumnClasses(columnCount);
  const rowColumns = buildColumnClasses(columnCount, headerColumns.map(() => DEFAULT_CELL_CLASS));

  if (variant === "simpleRows") {
    return (
      <div
        className={cn("flex w-full max-w-2xl flex-col gap-3", containerClassName, className)}
      >
        <SkeletonTableHeader columnClassNames={headerColumns} />
        <SkeletonRepeat
          count={rowCount}
          renderItem={() => <SkeletonTableRow columnClassNames={rowColumns} />}
        />
      </div>
    );
  }

  if (variant === "withActions") {
    const actionHeaderColumns = buildColumnClasses(columnCount, [
      "h-4 w-20",
      "h-4 w-24",
      "h-4 w-16",
      "h-4 w-20",
      "h-4 w-16",
    ]);
    const actionRowColumns = buildColumnClasses(columnCount, [
      DEFAULT_CELL_CLASS,
      DEFAULT_CELL_CLASS,
      DEFAULT_CELL_CLASS,
      DEFAULT_CELL_CLASS,
      DEFAULT_CELL_CLASS,
    ]);

    return (
      <div
        className={cn("flex w-full max-w-3xl flex-col gap-3", containerClassName, className)}
      >
        <SkeletonTableHeader columnClassNames={actionHeaderColumns} />
        <SkeletonRepeat
          count={rowCount}
          renderItem={() => (
            <SkeletonTableRow columnClassNames={actionRowColumns}>
              {actionRowColumns.slice(0, -1).map((columnClassName, index) => (
                <Skeleton className={columnClassName} key={index} />
              ))}
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </SkeletonTableRow>
          )}
        />
      </div>
    );
  }

  if (variant === "withAvatars") {
    return (
      <div
        className={cn("flex w-full max-w-2xl flex-col gap-3", containerClassName, className)}
      >
        <SkeletonTableHeader columnClassNames={headerColumns} />
        <SkeletonRepeat
          count={rowCount}
          renderItem={() => (
            <SkeletonTableRow columnClassNames={rowColumns}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </SkeletonTableRow>
          )}
        />
      </div>
    );
  }

  if (variant === "expandableRows") {
    return (
      <div
        className={cn("flex w-full max-w-2xl flex-col gap-3", containerClassName, className)}
      >
        <SkeletonTableHeader columnClassNames={headerColumns} />
        <div className="flex flex-col gap-2">
          <SkeletonTableRow columnClassNames={rowColumns}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </SkeletonTableRow>
          <div className="rounded-md bg-muted/50 py-2 pr-4 pl-10">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        </div>
        <SkeletonTableRow columnClassNames={rowColumns}>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </SkeletonTableRow>
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full max-w-2xl flex-col gap-4", containerClassName, className)}
    >
      <div className="flex flex-col gap-3">
        <SkeletonTableHeader columnClassNames={headerColumns} />
        <SkeletonRepeat
          count={rowCount}
          renderItem={() => <SkeletonTableRow columnClassNames={rowColumns} />}
        />
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton className="h-8 w-8 rounded-md" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
