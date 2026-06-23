"use client";

import type { ReactNode } from "react";

/**
 * Settings chrome for `/{slug}/dashboard/settings/*`.
 *
 * Uses `SettingsUnderlineTabs` for both personal `(user)` and tenant `(saas)` routes:
 * tab triggers are `<Link>`s — `Tabs` `value` mirrors the URL leaf for the active underline.
 *
 * Sidebar still gates **discovery** into SaaS (`AppSidebar` » Workspace settings » General).
 */

import { usePathname } from "next/navigation";

import { SettingsUnderlineTabs } from "@/components/dashboard/settings/settings-underline-tabs";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { settingsLeafFromPathname, workspacePath } from "@/lib/routing/workspace-paths";

const USER_SETTING_SLUGS = ["account", "notifications", "billing"] as const;
const SAAS_SETTING_SLUGS = ["workspace"] as const;

const USER_LEAVES = new Set<string>(USER_SETTING_SLUGS);
const SAAS_LEAVES = new Set<string>(SAAS_SETTING_SLUGS);

const USER_TAB_LABELS: Record<(typeof USER_SETTING_SLUGS)[number], string> = {
  account: "Account",
  notifications: "Notifications",
  billing: "Billing",
};

const SAAS_TAB_LABELS: Record<(typeof SAAS_SETTING_SLUGS)[number], string> = {
  workspace: "General",
};

export function DashboardSettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspace();
  const leaf = settingsLeafFromPathname(pathname ?? "");

  const activeSaasChrome = !!(leaf && SAAS_LEAVES.has(leaf));
  const tabSlugs = activeSaasChrome ? SAAS_SETTING_SLUGS : USER_SETTING_SLUGS;
  const tabLabels = activeSaasChrome ? SAAS_TAB_LABELS : USER_TAB_LABELS;

  const fallbackSlug = activeSaasChrome ? SAAS_SETTING_SLUGS[0] : USER_SETTING_SLUGS[0];

  const activeLeaves = activeSaasChrome ? SAAS_LEAVES : USER_LEAVES;
  const tabValue = leaf && activeLeaves.has(leaf) ? leaf : fallbackSlug;

  const settingsBase = activeWorkspace
    ? workspacePath(activeWorkspace.slug, "/settings")
    : "#";

  return (
    <div className="@container/settings flex flex-1 flex-col">
      <div className="flex w-full shrink-0 flex-col gap-2 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <SettingsUnderlineTabs
            value={tabValue}
            tabs={tabSlugs.map((slug) => ({
              value: slug,
              label: tabLabels[slug as keyof typeof tabLabels],
              href: `${settingsBase}/${slug}`,
            }))}
          />
          <div className="mt-6 flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
