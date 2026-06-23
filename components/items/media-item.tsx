import type { MediaItemProps } from "@/components/items/types";
import { ImageMediaList, ItemRow } from "@/components/items/utils/item-row";
import { cn } from "@/lib/utils";

/**
 * Media item covering Kibo UI media-1…3 patterns.
 * https://www.kibo-ui.com/patterns/item/media
 */
export function MediaItem({
  variant = "iconMedia",
  title,
  description,
  media,
  action,
  items,
  size,
  itemVariant = "outline",
  className,
  containerClassName,
  groupClassName,
  contentClassName,
  titleClassName,
}: MediaItemProps) {
  if (variant === "imageMedia") {
    if (!items?.length) {
      return null;
    }

    return (
      <ImageMediaList
        containerClassName={containerClassName}
        groupClassName={groupClassName}
        items={items}
      />
    );
  }

  const resolvedAction =
    action ??
    (variant === "iconMedia"
      ? { type: "button" as const, label: "Review" }
      : undefined);

  return (
    <div className={cn("flex w-full max-w-lg flex-col gap-6", containerClassName)}>
      <ItemRow
        action={resolvedAction}
        className={cn("bg-background", className)}
        contentClassName={contentClassName}
        description={description}
        itemVariant={itemVariant}
        media={media}
        size={size}
        title={title}
        titleClassName={titleClassName}
      />
    </div>
  );
}
