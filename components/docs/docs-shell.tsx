"use client";

import type { CSSProperties, ReactNode } from "react";

import { DocsShellProvider } from "@/components/docs/docs-shell-context";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsSiteHeader } from "@/components/docs/docs-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { DocsPageRef, SerializedDocsNavItem } from "@/types/docs-nav";

type DocsShellProps = {
  navItems: SerializedDocsNavItem[];
  pageTitles: DocsPageRef[];
  children: ReactNode;
};

/**
 * Documentation chrome — mirrors workspace dashboard shell (inset sidebar + header).
 */
export function DocsShell({ navItems, pageTitles, children }: DocsShellProps) {
  return (
    <DocsShellProvider navItems={navItems} pageTitles={pageTitles}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
      >
        <DocsSidebar />
        <SidebarInset>
          <DocsSiteHeader />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DocsShellProvider>
  );
}
