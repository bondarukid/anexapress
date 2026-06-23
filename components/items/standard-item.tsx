import type { StandardItemProps } from "@/components/items/types";
import { ItemRow } from "@/components/items/utils/item-row";
import { cn } from "@/lib/utils";

/**
 * Standard item covering Kibo UI standard-1…2 patterns.
 * https://www.kibo-ui.com/patterns/item/standard
 */
export function StandardItem({
  variant = "basic",
  title,
  description,
  href = "#",
  media,
  action,
  size,
  itemVariant = "outline",
  className,
  containerClassName,
  contentClassName,
  titleClassName,
}: StandardItemProps) {
  if (variant === "mediaAndIcon") {
    return (
      <div className={cn("flex w-full max-w-md flex-col gap-6", containerClassName)}>
        <ItemRow
          action={action ?? { type: "chevron" }}
          asLink
          className={className}
          contentClassName={contentClassName}
          href={href}
          itemVariant={itemVariant}
          media={media}
          size={size ?? "sm"}
          title={title}
          titleClassName={titleClassName}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-6", containerClassName)}>
      <ItemRow
        action={action ?? { type: "button", label: "Action" }}
        className={cn("bg-background", className)}
        contentClassName={contentClassName}
        description={description}
        itemVariant={itemVariant}
        size={size}
        title={title}
        titleClassName={titleClassName}
      />
    </div>
  );
}
