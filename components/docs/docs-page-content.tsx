import type { ReactNode } from "react";

import {
  DocsTocDesktop,
  DocsTocMobile,
  DocsTocProvider,
} from "@/components/docs/docs-toc";
import type { TOCItemType } from "fumadocs-core/toc";

type DocsPageContentProps = {
  toc: TOCItemType[];
  children: ReactNode;
};

/**
 * Docs article layout — dashboard-style padding with optional TOC rail.
 */
export function DocsPageContent({ toc, children }: DocsPageContentProps) {
  return (
    <DocsTocProvider toc={toc}>
      <div className="flex flex-1 flex-col p-6">
        <DocsTocMobile />
        <div className="flex min-w-0 flex-1 gap-8">
          <article className="min-w-0 flex-1">{children}</article>
          <DocsTocDesktop />
        </div>
      </div>
    </DocsTocProvider>
  );
}
