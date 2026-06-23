import { CustomKeymap } from "novel";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

const ATOM_BLOCK_TYPES = new Set(["image", "youtube", "horizontalRule"]);

function nodeEqualsType({
  types,
  node,
}: {
  types: ProseMirrorNode["type"] | ProseMirrorNode["type"][];
  node: ProseMirrorNode | null;
}): boolean {
  if (!node) return false;
  if (Array.isArray(types)) {
    return types.includes(node.type);
  }
  return node.type === types;
}

/**
 * Keeps an empty paragraph at the end of the document when the last block is
 * an atom (image, YouTube, divider) so the editor always has a place to type.
 */
export const TrailingParagraph = CustomKeymap.extend({
  name: "trailingParagraph",

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? [];
    const pluginKey = new PluginKey(this.name);
    const defaultNode =
      this.editor.schema.topNodeType.contentMatch.defaultType?.name ?? "paragraph";
    const disabledNodes = Object.entries(this.editor.schema.nodes)
      .map(([, value]) => value)
      .filter((node) => [defaultNode].includes(node.name));

    const trailingPlugin = new Plugin({
      key: pluginKey,
      appendTransaction: (transactions, __, state) => {
        const shouldInsertNodeAtEnd = pluginKey.getState(state);
        const { doc, tr, schema } = state;
        const type = schema.nodes[defaultNode];

        if (!shouldInsertNodeAtEnd || !type) {
          return null;
        }

        if (!transactions.some((transaction) => transaction.docChanged)) {
          return null;
        }

        return tr.insert(doc.content.size, type.create());
      },
      state: {
        init: (_, state) => {
          const lastNode = state.doc.lastChild;
          return !nodeEqualsType({ node: lastNode, types: disabledNodes });
        },
        apply: (tr, value) => {
          if (!tr.docChanged) {
            return value;
          }
          const lastNode = tr.doc.lastChild;
          return !nodeEqualsType({ node: lastNode, types: disabledNodes });
        },
      },
    });

    const paragraphAfterAtomPlugin = new Plugin({
      key: new PluginKey("paragraphAfterAtomBlocks"),
      appendTransaction: (transactions, __, state) => {
        if (!transactions.some((transaction) => transaction.docChanged)) {
          return null;
        }

        const { doc, schema } = state;
        const paragraphType = schema.nodes.paragraph;
        if (!paragraphType) {
          return null;
        }

        const insertPositions: number[] = [];

        doc.forEach((node, offset, index) => {
          if (!ATOM_BLOCK_TYPES.has(node.type.name)) {
            return;
          }

          if (index === doc.childCount - 1) {
            return;
          }

          const next = doc.child(index + 1);
          if (next?.type.name === "paragraph") {
            return;
          }

          insertPositions.push(offset + node.nodeSize);
        });

        if (insertPositions.length === 0) {
          return null;
        }

        const tr = state.tr;
        for (let index = insertPositions.length - 1; index >= 0; index -= 1) {
          tr.insert(insertPositions[index], paragraphType.create());
        }

        return tr;
      },
    });

    return [...parentPlugins, trailingPlugin, paragraphAfterAtomPlugin];
  },
});
