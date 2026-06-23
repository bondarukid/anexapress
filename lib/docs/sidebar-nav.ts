import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";

import type { SerializedDocsNavItem } from "@/types/docs-nav";

function nodeNameToString(name: ReactNode): string {
  if (typeof name === "string") return name;
  if (typeof name === "number") return String(name);
  return "Untitled";
}

function serializeNode(node: PageTree.Node): SerializedDocsNavItem | null {
  if (node.type === "separator") return null;

  if (node.type === "page") {
    return {
      title: nodeNameToString(node.name),
      url: node.url,
    };
  }

  const childItems = node.children
    .map(serializeNode)
    .filter((item): item is SerializedDocsNavItem => item !== null);

  if (node.index) {
    const indexItem: SerializedDocsNavItem = {
      title: nodeNameToString(node.index.name),
      url: node.index.url,
    };
    const subPages = childItems.filter((item) => item.url !== node.index?.url);

    if (subPages.length === 0) {
      return {
        title: nodeNameToString(node.name) || indexItem.title,
        url: node.index.url,
      };
    }

    return {
      title: nodeNameToString(node.name),
      items: [indexItem, ...subPages],
      defaultOpen: node.defaultOpen ?? true,
    };
  }

  if (childItems.length === 0) return null;
  if (childItems.length === 1 && !node.name) return childItems[0];

  return {
    title: nodeNameToString(node.name),
    items: childItems,
    defaultOpen: node.defaultOpen ?? true,
  };
}

/**
 * Converts a Fumadocs page tree into serializable sidebar navigation items.
 */
export function serializePageTree(root: PageTree.Root): SerializedDocsNavItem[] {
  return root.children
    .map(serializeNode)
    .filter((item): item is SerializedDocsNavItem => item !== null);
}

/** Normalizes browser and internal docs paths for active-state checks. */
export function normalizeDocsPathname(pathname: string): string {
  let path = pathname.replace(/\/$/, "") || "/";
  if (path.startsWith("/docs")) {
    path = path.slice("/docs".length) || "/";
  }
  return path;
}

/** Returns whether a docs URL matches the current pathname. */
export function isDocsUrlActive(url: string, pathname: string): boolean {
  const normalizedPath = normalizeDocsPathname(pathname);
  const normalizedUrl = url.replace(/\/$/, "") || "/";
  return normalizedPath === normalizedUrl;
}

/** Returns whether any child page in a folder group is active. */
export function isDocsNavGroupActive(
  items: SerializedDocsNavItem[],
  pathname: string,
): boolean {
  return items.some((item) => {
    if (item.url) return isDocsUrlActive(item.url, pathname);
    if (item.items) return isDocsNavGroupActive(item.items, pathname);
    return false;
  });
}
