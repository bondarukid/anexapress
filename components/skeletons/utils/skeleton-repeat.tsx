import type { ReactNode } from "react";

type SkeletonRepeatProps = {
  count: number;
  renderItem: (index: number) => ReactNode;
  className?: string;
};

/**
 * Renders a static list of skeleton items by count.
 */
export function SkeletonRepeat({ count, renderItem, className }: SkeletonRepeatProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div className={className} key={index}>
          {renderItem(index)}
        </div>
      ))}
    </>
  );
}
