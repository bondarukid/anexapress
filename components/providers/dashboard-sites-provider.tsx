"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { SiteSummary } from "@/types/site";

type DashboardSitesContextValue = {
  sites: SiteSummary[];
};

const DashboardSitesContext = createContext<DashboardSitesContextValue>({ sites: [] });

type DashboardSitesProviderProps = {
  sites: SiteSummary[];
  children: ReactNode;
};

/** Workspace sites list for sidebar navigation. */
export function DashboardSitesProvider({ sites, children }: DashboardSitesProviderProps) {
  const value = useMemo(() => ({ sites }), [sites]);
  return (
    <DashboardSitesContext.Provider value={value}>{children}</DashboardSitesContext.Provider>
  );
}

export function useDashboardSites(): DashboardSitesContextValue {
  return useContext(DashboardSitesContext);
}
