import type { TiptapContent, TiptapNode } from "@/types/tiptap";

export type PostBlockInsert = {
  postId: string;
  versionId: string;
  parentId: string | null;
  sortOrder: number;
  type: string;
  attrs: Record<string, unknown>;
  content: unknown[];
};

/**
 * Flattens a Tiptap JSON tree into rows for `post_blocks`.
 * Preserves parent/child hierarchy and sibling order.
 */
export function tiptapToBlocks(
  postId: string,
  versionId: string,
  doc: TiptapContent,
): PostBlockInsert[] {
  const blocks: PostBlockInsert[] = [];

  function walk(nodes: TiptapNode[] | undefined, parentId: string | null): void {
    if (!nodes) return;

    nodes.forEach((node, index) => {
      const inlineContent =
        node.text !== undefined
          ? [{ type: "text", text: node.text, marks: node.marks ?? [] }]
          : [];

      const childNodes = node.content ?? [];
      const hasBlockChildren = childNodes.some((child) => child.type !== "text");

      const block: PostBlockInsert = {
        postId,
        versionId,
        parentId,
        sortOrder: index,
        type: node.type,
        attrs: node.attrs ?? {},
        content: hasBlockChildren ? [] : inlineContent,
      };

      blocks.push(block);
      const blockIndex = blocks.length - 1;
      const blockId = `temp-${blockIndex}`;

      if (hasBlockChildren) {
        walk(childNodes, blockId);
      }
    });
  }

  walk(doc.content, null);

  return blocks.map((block) => {
    if (block.parentId?.startsWith("temp-")) {
      const parentIndex = Number.parseInt(block.parentId.replace("temp-", ""), 10);
      return { ...block, parentId: `__index_${parentIndex}__` };
    }
    return block;
  });
}

/**
 * Assigns stable UUID placeholders during insert; caller maps temp parent refs to inserted ids.
 */
export function tiptapToBlocksWithTempIds(
  postId: string,
  versionId: string,
  doc: TiptapContent,
): Array<PostBlockInsert & { tempId: string }> {
  const result: Array<PostBlockInsert & { tempId: string }> = [];

  function walk(nodes: TiptapNode[] | undefined, parentTempId: string | null): void {
    if (!nodes) return;

    nodes.forEach((node, index) => {
      const tempId = crypto.randomUUID();
      const childNodes = node.content ?? [];
      const hasBlockChildren = childNodes.some((child) => child.type !== "text");

      const inlineContent =
        node.text !== undefined
          ? [{ type: "text", text: node.text, marks: node.marks ?? [] }]
          : [];

      result.push({
        tempId,
        postId,
        versionId,
        parentId: parentTempId,
        sortOrder: index,
        type: node.type,
        attrs: node.attrs ?? {},
        content: hasBlockChildren ? [] : inlineContent,
      });

      if (hasBlockChildren) {
        walk(childNodes, tempId);
      }
    });
  }

  walk(doc.content, null);
  return result;
}
