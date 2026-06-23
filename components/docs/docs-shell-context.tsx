"use client";

import { createContext, useContext } from "react";

import type { DocsPageRef, SerializedDocsNavItem } from "@/types/docs-nav";

type DocsShellContextValue = {
  navItems: SerializedDocsNavItem[];
  pageTitles: DocsPageRef[];
};

const DocsShellContext = createContext<DocsShellContextValue | null>(null);

export function DocsShellProvider({
  navItems,
  pageTitles,
  children,
}: DocsShellContextValue & { children: React.ReactNode }) {
  return (
    <DocsShellContext.Provider value={{ navItems, pageTitles }}>
      {children}
    </DocsShellContext.Provider>
  );
}

export function useDocsShell(): DocsShellContextValue {
  const context = useContext(DocsShellContext);
  if (!context) {
    throw new Error("useDocsShell must be used within DocsShellProvider");
  }
  return context;
}
