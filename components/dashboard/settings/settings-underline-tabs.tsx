"use client";

/**
 * Underline tab chrome for dashboard settings (`DashboardSettingsShell`).
 *
 * Do not duplicate `TabsList` / `TabsTrigger` class strings elsewhere — import this
 * component or the exported constants.
 *
 * - **Static** (`defaultValue`, tabs `{ value, label }`): presentational tabs.
 * - **Routed** (`value`, tabs `{ value, label, href }`): Next `<Link>` + controlled `Tabs`.
 */

import Link from "next/link";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Shared `TabsList` classes for personal and SaaS settings routes. */
export const ACCOUNT_SETTINGS_LINE_TABS_LIST_CLASS =
  "flex w-full flex-wrap gap-2 rounded-none border-b p-0 sm:justify-start";

/** Shared `TabsTrigger` classes for personal and SaaS settings routes. */
export const ACCOUNT_SETTINGS_LINE_TAB_TRIGGER_CLASS =
  "not-data-active:hover:group-data-horizontal/tabs:after:bg-muted-foreground/30 border-0 text-base group-data-horizontal/tabs:after:-bottom-[0.5px] not-data-active:hover:group-data-horizontal/tabs:after:opacity-100 sm:flex-0";

export type RoutedAccountSettingsUnderlineTabsProps = {
  tabs: readonly { value: string; label: string; href: string }[];
  /** Current Radix `value`; mirror URL leaf for active underline */
  value: string;
  className?: string;
};

export type StaticAccountSettingsUnderlineTabsProps = {
  tabs: readonly { value: string; label: string }[];
  /** Radix `defaultValue` when tabs are purely presentational */
  defaultValue?: string;
  className?: string;
};

export type AccountSettingsUnderlineTabsProps =
  | RoutedAccountSettingsUnderlineTabsProps
  | StaticAccountSettingsUnderlineTabsProps;

export function SettingsUnderlineTabs(props: AccountSettingsUnderlineTabsProps) {
  const isRouted = (
    p: AccountSettingsUnderlineTabsProps,
  ): p is RoutedAccountSettingsUnderlineTabsProps => "value" in p;

  const tabsRootProps = isRouted(props)
    ? ({ value: props.value } as const)
    : ({
        defaultValue: props.defaultValue ?? props.tabs[0]?.value ?? "workspace",
      } as const);

  return (
    <Tabs className={cn("w-full", props.className)} {...tabsRootProps}>
      <TabsList variant="line" className={ACCOUNT_SETTINGS_LINE_TABS_LIST_CLASS}>
        {props.tabs.map((tab) =>
          "href" in tab ? (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              className={ACCOUNT_SETTINGS_LINE_TAB_TRIGGER_CLASS}
            >
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ) : (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={ACCOUNT_SETTINGS_LINE_TAB_TRIGGER_CLASS}
            >
              {tab.label}
            </TabsTrigger>
          ),
        )}
      </TabsList>
    </Tabs>
  );
}
