"use client";

import { leftPresets } from "@/components/drawers/presets";
import type { LeftDrawerProps } from "@/components/drawers/types";
import {
  DrawerFileTree,
  DrawerNavList,
  DrawerNestedNav,
  DrawerSearchNav,
} from "@/components/drawers/utils/drawer-layout";
import { DrawerShell } from "@/components/drawers/utils/drawer-shell";
import { cn } from "@/lib/utils";

/**
 * Left drawer covering Kibo UI left patterns.
 * https://www.kibo-ui.com/patterns/drawer/left
 */
export function LeftDrawer({
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
  navItems,
  nestedNavGroups,
  fileNodes,
  searchPlaceholder,
}: LeftDrawerProps) {
  const preset = leftPresets[variant] as Partial<LeftDrawerProps>;
  const resolvedTitle = title ?? preset.title;
  const resolvedDescription = description ?? preset.description;
  const resolvedBodyText = bodyText ?? preset.bodyText;
  const resolvedNavItems = navItems ?? preset.navItems;
  const resolvedNestedNavGroups = nestedNavGroups ?? preset.nestedNavGroups;
  const resolvedFileNodes = fileNodes ?? preset.fileNodes;
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? preset.searchPlaceholder;

  const renderBody = () => {
    if (children) {
      return <div className="flex flex-col gap-4 overflow-y-auto pb-4 text-sm">{children}</div>;
    }

    switch (variant) {
      case "navigationMenu":
        return (
          <div className="pb-4">
            <DrawerNavList items={resolvedNavItems ?? []} />
          </div>
        );

      case "nestedItems":
        return (
          <div className="pb-4">
            <DrawerNestedNav groups={resolvedNestedNavGroups ?? []} />
          </div>
        );

      case "withSearch":
        return (
          <div className="pb-4">
            <DrawerSearchNav
              items={resolvedNavItems ?? []}
              placeholder={resolvedSearchPlaceholder}
            />
          </div>
        );

      case "fileExplorer":
        return (
          <div className="pb-4">
            <DrawerFileTree nodes={resolvedFileNodes ?? []} />
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
      direction="left"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={resolvedTitle}
      description={resolvedDescription}
      footer={footer}
      triggerAsChild={triggerAsChild}
      dismissible={dismissible}
      shouldScaleBackground={shouldScaleBackground}
      contentClassName={cn("sm:max-w-sm", contentClassName)}
      headerClassName={headerClassName}
      bodyClassName={bodyClassName}
      footerClassName={footerClassName}
      defaultTriggerLabel={defaultTriggerLabel}
      body={renderBody()}
    />
  );
}
