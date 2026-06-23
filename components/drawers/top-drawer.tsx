"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";

import { topPresets } from "@/components/drawers/presets";
import type { DrawerCommandItem, TopDrawerProps } from "@/components/drawers/types";
import { DrawerQuickActionGrid } from "@/components/drawers/utils/drawer-layout";
import { DrawerShell } from "@/components/drawers/utils/drawer-shell";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";

/**
 * Top drawer covering Kibo UI top patterns.
 * https://www.kibo-ui.com/patterns/drawer/top
 */
export function TopDrawer({
  variant = "simple",
  trigger,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  triggerAsChild,
  dismissible,
  shouldScaleBackground,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  defaultTriggerLabel,
  bodyText,
  searchPlaceholder,
  searchResults,
  bannerMessage,
  bannerTitle,
  quickActions,
  commandItems,
  onSearch,
  onBannerDismiss,
}: TopDrawerProps) {
  const preset = topPresets[variant] as Partial<TopDrawerProps>;
  const resolvedTitle = title ?? preset.title;
  const resolvedDescription = description ?? preset.description;
  const resolvedBodyText = bodyText ?? preset.bodyText;
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? preset.searchPlaceholder;
  const resolvedSearchResults = searchResults ?? preset.searchResults;
  const resolvedBannerTitle = bannerTitle ?? preset.bannerTitle;
  const resolvedBannerMessage = bannerMessage ?? preset.bannerMessage;
  const resolvedQuickActions = quickActions ?? preset.quickActions;
  const resolvedCommandItems = commandItems ?? preset.commandItems;

  const [searchQuery, setSearchQuery] = useState("");

  const renderBody = () => {
    if (children) {
      return <div className="flex flex-col gap-4 overflow-y-auto pb-4 text-sm">{children}</div>;
    }

    switch (variant) {
      case "searchBar":
        return (
          <div className="pb-4">
            <Field>
              <FieldLabel htmlFor="top-drawer-search" id={getFieldLabelId("top-drawer-search")} className="sr-only">
                Search
              </FieldLabel>
              <Input
                id="top-drawer-search"
                placeholder={resolvedSearchPlaceholder}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  onSearch?.(event.target.value);
                }}
              />
            </Field>
            {resolvedSearchResults && resolvedSearchResults.length > 0 ? (
              <div className="mt-3 flex flex-col gap-1">
                {resolvedSearchResults.map((result: string) => (
                  <button
                    key={result}
                    type="button"
                    className="hover:bg-muted rounded-md px-3 py-2 text-left text-sm"
                  >
                    {result}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );

      case "notificationBanner":
        return (
          <div className="bg-primary/10 border-primary/20 mb-4 flex items-start gap-3 rounded-lg border p-4">
            <Bell className="text-primary mt-0.5 size-4 shrink-0" />
            <div className="flex flex-1 flex-col gap-1">
              {resolvedBannerTitle ? (
                <p className="text-sm font-medium">{resolvedBannerTitle}</p>
              ) : null}
              <p className="text-muted-foreground text-sm">
                {resolvedBannerMessage ?? "Notification message."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBannerDismiss}
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </Button>
          </div>
        );

      case "quickActions":
        return (
          <div className="pb-4">
            <DrawerQuickActionGrid actions={resolvedQuickActions ?? []} />
          </div>
        );

      case "commandBar":
        return (
          <div className="pb-4">
            <Command className="rounded-lg border">
              <CommandInput placeholder="Type a command..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Commands">
                  {resolvedCommandItems?.map((item: DrawerCommandItem) => (
                    <CommandItem key={item.id} onSelect={item.onSelect}>
                      {item.label}
                      {item.shortcut ? (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        );

      default:
        return (
          <p className="text-muted-foreground pb-4 text-sm">
            {resolvedBodyText ?? "Drawer content appears here."}
          </p>
        );
    }
  };

  return (
    <DrawerShell
      direction="top"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={variant === "notificationBanner" ? undefined : resolvedTitle}
      description={variant === "notificationBanner" ? undefined : resolvedDescription}
      footer={footer}
      triggerAsChild={triggerAsChild}
      dismissible={dismissible}
      shouldScaleBackground={shouldScaleBackground}
      contentClassName={contentClassName}
      headerClassName={headerClassName}
      bodyClassName={bodyClassName}
      footerClassName={footerClassName}
      defaultTriggerLabel={defaultTriggerLabel}
      showHeader={variant !== "notificationBanner"}
      body={renderBody()}
    />
  );
}
