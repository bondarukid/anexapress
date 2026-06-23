"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  TOCProvider,
  TOCScrollArea,
  useTOCItems,
} from "fumadocs-ui/components/toc";
import {
  TOCItem,
  TOCItems,
  TOCEmpty,
} from "fumadocs-ui/components/toc/default";
import type { TOCItemType } from "fumadocs-core/toc";
import { ChevronDown, Text } from "lucide-react";

type DocsTocProps = {
  toc: TOCItemType[];
  children: React.ReactNode;
};

export function DocsTocProvider({ toc, children }: DocsTocProps) {
  if (toc.length === 0) {
    return children;
  }

  return <TOCProvider toc={toc}>{children}</TOCProvider>;
}

function DocsTocList() {
  const items = useTOCItems();
  if (items.length === 0) return null;

  return (
    <>
      <h3 className="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-sm font-medium">
        <Text className="size-4" aria-hidden />
        On this page
      </h3>
      <TOCScrollArea className="max-h-[calc(100vh-12rem)]">
        <TOCItems>
          {items.length === 0 ? <TOCEmpty /> : null}
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </TOCScrollArea>
    </>
  );
}

/** Collapsible TOC for viewports below xl. */
export function DocsTocMobile() {
  const items = useTOCItems();
  if (items.length === 0) return null;

  return (
    <Collapsible className="mb-6 xl:hidden">
      <CollapsibleTrigger className="bg-muted/50 text-muted-foreground hover:bg-muted flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium">
        On this page
        <ChevronDown className="size-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <TOCScrollArea className="max-h-64">
          <TOCItems>
            {items.map((item) => (
              <TOCItem key={item.url} item={item} />
            ))}
          </TOCItems>
        </TOCScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Sticky TOC rail for xl+ viewports. */
export function DocsTocDesktop() {
  const items = useTOCItems();
  if (items.length === 0) return null;

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-6">
        <DocsTocList />
      </div>
    </aside>
  );
}
