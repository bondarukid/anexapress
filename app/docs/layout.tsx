import type { ReactNode } from "react";

import { DocsShell } from "@/components/docs/docs-shell";
import { flattenPageTitles } from "@/lib/docs/page-title";
import { serializePageTree } from "@/lib/docs/sidebar-nav";
import { source } from "@/lib/docs/source";
import { RootProvider } from "fumadocs-ui/provider/next";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  const navItems = serializePageTree(source.getPageTree());
  const pageTitles = flattenPageTitles(navItems);

  return (
    <RootProvider search={{ options: { api: "/api/search" } }}>
      <DocsShell navItems={navItems} pageTitles={pageTitles}>
        {children}
      </DocsShell>
    </RootProvider>
  );
}
