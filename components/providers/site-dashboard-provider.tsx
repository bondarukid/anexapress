"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useDashboardSites } from "@/components/providers/dashboard-sites-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { parseSiteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import type { SiteSummary } from "@/types/site";

type SiteDashboardContextValue = {
  activeSite: SiteSummary;
  siteDashboardBase: string;
};

const SiteDashboardContext = createContext<SiteDashboardContextValue | null>(null);

type SiteDashboardProviderProps = {
  activeSite: SiteSummary;
  siteDashboardBase: string;
  children: ReactNode;
};

/** Site-scoped dashboard context (active site + URL prefix). */
export function SiteDashboardProvider({
  activeSite,
  siteDashboardBase,
  children,
}: SiteDashboardProviderProps) {
  const value = useMemo(
    () => ({ activeSite, siteDashboardBase }),
    [activeSite, siteDashboardBase],
  );

  return (
    <SiteDashboardContext.Provider value={value}>{children}</SiteDashboardContext.Provider>
  );
}

/** Returns site dashboard context; only available under `/dashboard/sites/[siteId]/...`. */
export function useSiteDashboard(): SiteDashboardContextValue {
  const context = useContext(SiteDashboardContext);
  if (!context) {
    throw new Error("useSiteDashboard must be used within SiteDashboardProvider");
  }
  return context;
}

/** Optional site dashboard context for components shared across workspace and site routes. */
export function useOptionalSiteDashboard(): SiteDashboardContextValue | null {
  return useContext(SiteDashboardContext);
}

/**
 * Site dashboard context for chrome (sidebar/header) that renders above nested layouts.
 * Prefers `SiteDashboardProvider` when present; otherwise derives from pathname + sites list.
 */
export function useResolvedSiteDashboard(): SiteDashboardContextValue | null {
  const fromProvider = useOptionalSiteDashboard();
  const pathname = usePathname();
  const { sites } = useDashboardSites();
  const { activeWorkspace } = useWorkspace();

  return useMemo(() => {
    if (fromProvider) {
      return fromProvider;
    }

    const parsed = parseSiteDashboardPath(pathname);
    if (!parsed || !activeWorkspace) {
      return null;
    }

    const activeSite = sites.find((site) => site.id === parsed.siteId);
    if (!activeSite) {
      return null;
    }

    return {
      activeSite,
      siteDashboardBase: workspacePathFromSummary(activeWorkspace, `/sites/${activeSite.id}`),
    };
  }, [activeWorkspace, fromProvider, pathname, sites]);
}
