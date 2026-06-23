import { normalizeDocsPathname } from "@/lib/docs/sidebar-nav";
import type { DocsPageRef, SerializedDocsNavItem } from "@/types/docs-nav";

/**
 * Flattens serialized nav items into page references for header title lookup.
 */
export function flattenPageTitles(items: SerializedDocsNavItem[]): DocsPageRef[] {
  const result: DocsPageRef[] = [];

  for (const item of items) {
    if (item.url) {
      result.push({ url: item.url, title: item.title });
    }
    if (item.items) {
      result.push(...flattenPageTitles(item.items));
    }
  }

  return result;
}

/**
 * Resolves the current docs page title from pathname and a flat page index.
 */
export function getPageTitleFromPathname(
  pages: DocsPageRef[],
  pathname: string,
): string {
  const normalized = normalizeDocsPathname(pathname);
  const match = pages.find((page) => {
    const pagePath = page.url.replace(/\/$/, "") || "/";
    return pagePath === normalized;
  });

  return match?.title ?? "Documentation";
}
