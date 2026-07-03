/** Minimal Tiptap/Novel JSON document shape used across CMS layers. */
export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
};

export type TiptapContent = {
  type: "doc";
  content?: TiptapNode[];
};

export const EMPTY_TIPTAP_DOC: TiptapContent = {
  type: "doc",
  content: [{ type: "paragraph", attrs: { blockTitle: "Text" } }],
};
