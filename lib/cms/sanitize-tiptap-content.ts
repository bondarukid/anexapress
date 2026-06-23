import { EMPTY_TIPTAP_DOC, type TiptapContent, type TiptapNode } from "@/types/tiptap";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanNode(node: TiptapNode): TiptapNode | null {
  if (node.type === "youtube") {
    const src = node.attrs?.src;
    if (!isNonEmptyString(src)) {
      return null;
    }
  }

  if (node.type === "image") {
    const src = node.attrs?.src;
    if (!isNonEmptyString(src)) {
      return null;
    }
  }

  const cleanedContent = node.content
    ?.map((child) => cleanNode(child))
    .filter((child): child is TiptapNode => child !== null);

  const cleanedMarks = node.marks?.filter((mark) => {
    if (mark.type !== "link") return true;
    return isNonEmptyString(mark.attrs?.href);
  });

  const nextNode: TiptapNode = {
    ...node,
    ...(cleanedContent ? { content: cleanedContent } : {}),
    ...(cleanedMarks ? { marks: cleanedMarks } : {}),
  };

  if (
    nextNode.type === "paragraph" &&
    (!nextNode.content || nextNode.content.length === 0) &&
    !nextNode.text
  ) {
    return nextNode;
  }

  return nextNode;
}

const ATOM_BLOCK_TYPES = new Set(["image", "youtube", "horizontalRule"]);

function ensureEditableParagraphAfterAtoms(content: TiptapNode[]): TiptapNode[] {
  const nextContent: TiptapNode[] = [];

  content.forEach((node, index) => {
    nextContent.push(node);

    if (!ATOM_BLOCK_TYPES.has(node.type)) {
      return;
    }

    const following = content[index + 1];
    if (following?.type === "paragraph") {
      return;
    }

    nextContent.push({ type: "paragraph" });
  });

  const lastNode = nextContent[nextContent.length - 1];
  if (lastNode && ATOM_BLOCK_TYPES.has(lastNode.type)) {
    nextContent.push({ type: "paragraph" });
  }

  return nextContent;
}

function cleanDocument(doc: TiptapContent): TiptapContent {
  const content = doc.content
    ?.map((node) => cleanNode(node))
    .filter((node): node is TiptapNode => node !== null);

  if (!content || content.length === 0) {
    return EMPTY_TIPTAP_DOC;
  }

  return {
    type: "doc",
    content: ensureEditableParagraphAfterAtoms(content),
  };
}

/**
 * Strips non-JSON values (functions, symbols, undefined) from a Tiptap document
 * and removes nodes that crash extensions at runtime (e.g. YouTube with null src).
 */
export function sanitizeTiptapContent(content: unknown): TiptapContent {
  if (content === null || content === undefined) {
    return EMPTY_TIPTAP_DOC;
  }

  try {
    const parsed = JSON.parse(JSON.stringify(content)) as TiptapContent;
    if (parsed?.type !== "doc") {
      return EMPTY_TIPTAP_DOC;
    }
    return cleanDocument(parsed);
  } catch {
    return EMPTY_TIPTAP_DOC;
  }
}
