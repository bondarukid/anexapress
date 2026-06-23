import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { BaseItemData } from "@/components/items/types";
import { RenderItemActions } from "@/components/items/utils/item-actions";
import {
  RenderItemContent,
  RenderItemTrailingContent,
} from "@/components/items/utils/item-content";
import { RenderItemMedia } from "@/components/items/utils/item-media";
import { cn } from "@/lib/utils";

type ItemRowProps = BaseItemData & {
  asLink?: boolean;
  external?: boolean;
  onActionClick?: () => void;
};

/**
 * Shared single-item row renderer used across category components.
 */
export function ItemRow({
  title,
  description,
  href,
  media,
  action,
  size,
  itemVariant = "default",
  className,
  contentClassName,
  titleClassName,
  trailingContent,
  asLink = false,
  external = false,
  onActionClick,
}: ItemRowProps) {
  const resolvedAction =
    action?.type === "button" || action?.type === "icon"
      ? {
          ...action,
          onClick: action.onClick ?? onActionClick,
        }
      : action;

  const content = (
    <>
      <RenderItemMedia media={media} />
      <RenderItemContent
        contentClassName={contentClassName}
        description={description}
        title={title}
        titleClassName={titleClassName}
      />
      <RenderItemTrailingContent
        className={trailingContent?.className}
        description={trailingContent?.description}
      />
      <RenderItemActions action={resolvedAction} />
    </>
  );

  if (asLink && href) {
    return (
      <Item
        asChild
        className={cn("bg-background", className)}
        size={size}
        variant={itemVariant}
      >
        <a href={href} rel={external ? "noopener noreferrer" : undefined} target={external ? "_blank" : undefined}>
          {content}
        </a>
      </Item>
    );
  }

  return (
    <Item className={className} size={size} variant={itemVariant}>
      {content}
    </Item>
  );
}

type ImageMediaListProps = {
  items: BaseItemData[];
  groupClassName?: string;
  containerClassName?: string;
};

/**
 * Renders a linked image-media list matching Kibo media-3.
 */
export function ImageMediaList({
  items,
  groupClassName,
  containerClassName,
}: ImageMediaListProps) {
  return (
    <div className={cn("flex w-full max-w-md flex-col gap-6", containerClassName)}>
      <ItemGroup className={cn("gap-4", groupClassName)}>
        {items.map((entry) => (
          <Item
            asChild
            className={cn("bg-background", entry.className)}
            key={entry.id ?? entry.title}
            variant={entry.itemVariant ?? "outline"}
          >
            <a href={entry.href ?? "#"}>
              <RenderItemMedia media={entry.media} />
              <ItemContent>
                <ItemTitle className={cn("line-clamp-1", entry.titleClassName)}>
                  {entry.title}
                </ItemTitle>
                {entry.description ? (
                  <ItemDescription>{entry.description}</ItemDescription>
                ) : null}
              </ItemContent>
              <RenderItemTrailingContent
                className={entry.trailingContent?.className}
                description={entry.trailingContent?.description}
              />
            </a>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
