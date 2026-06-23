import { Fragment } from "react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import type { LayoutItemEntry, LayoutItemProps } from "@/components/items/types";
import { ItemRow } from "@/components/items/utils/item-row";
import { cn } from "@/lib/utils";

function renderLayoutEntry(
  entry: LayoutItemEntry,
  options?: { asLink?: boolean; onAction?: (id: string) => void },
) {
  const entryId = entry.id ?? entry.title;

  if (options?.asLink && entry.href) {
    return (
      <ItemRow
        key={entryId}
        {...entry}
        action={entry.action}
        asLink
        onActionClick={
          entry.action?.type === "icon" || entry.action?.type === "button"
            ? () => options.onAction?.(entryId)
            : undefined
        }
      />
    );
  }

  if (entry.headerImage) {
    return (
      <Item
        className={cn("bg-background", entry.className)}
        key={entryId}
        variant={entry.itemVariant ?? "outline"}
      >
        <ItemHeader>
          {/* Kibo patterns use plain img for framework-agnostic examples */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={entry.headerImage.alt}
            className={cn(
              "aspect-[3/2] w-full rounded-sm object-cover",
              entry.headerImage.className,
            )}
            height={entry.headerImage.height ?? 480}
            src={entry.headerImage.src}
            width={entry.headerImage.width ?? 640}
          />
        </ItemHeader>
        <ItemContent>
          <ItemTitle>{entry.title}</ItemTitle>
          {entry.description ? (
            <ItemDescription>{entry.description}</ItemDescription>
          ) : null}
        </ItemContent>
      </Item>
    );
  }

  return (
    <ItemRow
      key={entryId}
      {...entry}
      onActionClick={
        entry.action?.type === "icon" || entry.action?.type === "button"
          ? () => options?.onAction?.(entryId)
          : undefined
      }
    />
  );
}

/**
 * Layout item covering Kibo UI layout-1…3 patterns.
 * https://www.kibo-ui.com/patterns/item/layout
 */
export function LayoutItem({
  variant = "group",
  items = [],
  containerClassName,
  groupClassName,
  gridClassName,
  onAction,
}: LayoutItemProps) {
  if (variant === "sizes") {
    return (
      <div className={cn("flex w-full max-w-md flex-col gap-6", containerClassName)}>
        {items.map((entry) =>
          renderLayoutEntry(entry, {
            asLink: Boolean(entry.href),
            onAction,
          }),
        )}
      </div>
    );
  }

  if (variant === "withHeader") {
    return (
      <div className={cn("flex w-full max-w-xl flex-col gap-6", containerClassName)}>
        <ItemGroup className={cn("grid grid-cols-3 gap-4", gridClassName, groupClassName)}>
          {items.map((entry) => renderLayoutEntry(entry))}
        </ItemGroup>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-6", containerClassName)}>
      <ItemGroup className={groupClassName}>
        {items.map((entry, index) => (
          <Fragment key={entry.id ?? entry.title}>
            {renderLayoutEntry(entry, { onAction })}
            {index !== items.length - 1 ? <ItemSeparator /> : null}
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}
