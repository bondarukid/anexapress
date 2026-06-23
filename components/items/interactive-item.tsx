"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { InteractiveItemProps } from "@/components/items/types";
import { ItemRow } from "@/components/items/utils/item-row";
import { RenderItemMedia } from "@/components/items/utils/item-media";
import { cn } from "@/lib/utils";

/**
 * Interactive item covering Kibo UI interactive-1…2 patterns.
 * https://www.kibo-ui.com/patterns/item/interactive
 */
export function InteractiveItem({
  variant = "link",
  title,
  description,
  href = "#",
  action,
  itemVariant,
  className,
  containerClassName,
  triggerLabel = "Select",
  dropdownItems = [],
  onSelect,
  dropdownContentClassName,
  dropdownAlign = "end",
}: InteractiveItemProps) {
  if (variant === "dropdown") {
    return (
      <div
        className={cn(
          "flex min-h-64 w-full max-w-md flex-col items-center gap-6",
          containerClassName,
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-fit" size="sm" type="button" variant="outline">
              {triggerLabel}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={dropdownAlign}
            className={cn("w-72 [--radius:0.65rem]", dropdownContentClassName)}
          >
            {dropdownItems.map((entry) => (
              <DropdownMenuItem
                className="p-0"
                key={entry.id}
                onSelect={() => {
                  entry.onSelect?.();
                  onSelect?.(entry.id);
                }}
              >
                <Item className="w-full p-2" size="sm">
                  <RenderItemMedia media={entry.media} />
                  <ItemContent className="gap-0.5">
                    <ItemTitle>{entry.title}</ItemTitle>
                    {entry.description ? (
                      <ItemDescription>{entry.description}</ItemDescription>
                    ) : null}
                  </ItemContent>
                </Item>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const isExternal = variant === "linkExternal";

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-4", containerClassName)}>
      <ItemRow
        action={
          action ??
          (isExternal ? { type: "externalLink" } : { type: "chevron" })
        }
        asLink
        className={isExternal ? cn("bg-background", className) : className}
        description={description}
        external={isExternal}
        href={href}
        itemVariant={isExternal ? (itemVariant ?? "outline") : itemVariant}
        title={title}
      />
    </div>
  );
}
