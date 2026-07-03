import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import { Extension, type Attribute } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import {
  CMS_BLOCK_BACKGROUNDS,
  CMS_BLOCK_INDENTS,
  CMS_BLOCK_SPACING,
  CMS_BLOCK_VARIANTS,
  CMS_BLOCK_WIDTHS,
  CMS_COLOR_THEMES,
} from "@/lib/cms/editor-block-attributes";
import { resolveBlockTitle } from "@/lib/cms/editor-block-title";

function buildClassList(attrs: Record<string, string | null | undefined>): string[] {
  const classes: string[] = [];

  if (attrs.blockVariant && attrs.blockVariant !== "paragraph") {
    classes.push(`cms-block--${attrs.blockVariant}`);
  }

  if (attrs.blockWidth && attrs.blockWidth !== "default") {
    classes.push(`cms-block-width--${attrs.blockWidth}`);
  }

  if (attrs.spacingTop && attrs.spacingTop !== "none") {
    classes.push(`cms-spacing-top--${attrs.spacingTop}`);
  }

  if (attrs.spacingBottom && attrs.spacingBottom !== "none") {
    classes.push(`cms-spacing-bottom--${attrs.spacingBottom}`);
  }

  if (attrs.blockIndent && attrs.blockIndent !== "none") {
    classes.push(`cms-block-indent--${attrs.blockIndent}`);
  }

  if (attrs.colorTheme && attrs.colorTheme !== "default") {
    classes.push(`cms-color-theme--${attrs.colorTheme}`);
  }

  if (attrs.blockBackground && attrs.blockBackground !== "none") {
    classes.push(`cms-block-bg--${attrs.blockBackground}`);
  }

  return classes;
}

function createDataAttribute<T extends string>(
  values: readonly T[],
  defaultValue: T,
  dataAttr: string,
  attrKey: string,
): Attribute {
  return {
    default: defaultValue,
    parseHTML: (element) => {
      const raw = element.getAttribute(dataAttr);
      if (raw && (values as readonly string[]).includes(raw)) {
        return raw as T;
      }

      return defaultValue;
    },
    renderHTML: (attributes) => {
      const value = attributes[attrKey] as T | undefined;
      const resolved = value ?? defaultValue;
      if (resolved === defaultValue) {
        return {};
      }

      return { [dataAttr]: resolved };
    },
  };
}

function createLayoutAttributes(): Record<string, Attribute> {
  return {
    blockWidth: createDataAttribute(CMS_BLOCK_WIDTHS, "default", "data-block-width", "blockWidth"),
    spacingTop: createDataAttribute(CMS_BLOCK_SPACING, "none", "data-spacing-top", "spacingTop"),
    spacingBottom: createDataAttribute(
      CMS_BLOCK_SPACING,
      "none",
      "data-spacing-bottom",
      "spacingBottom",
    ),
    blockIndent: createDataAttribute(CMS_BLOCK_INDENTS, "none", "data-block-indent", "blockIndent"),
    colorTheme: createDataAttribute(CMS_COLOR_THEMES, "default", "data-color-theme", "colorTheme"),
  };
}

function mergeBlockHtmlAttributes(attributes: Record<string, unknown>): Record<string, string> {
  const attrs = attributes as Record<string, string | null | undefined>;
  const classes = buildClassList(attrs);
  const htmlAttrs: Record<string, string> = {};

  if (classes.length > 0) {
    htmlAttrs.class = classes.join(" ");
  }

  const dataMappings: Array<[string, string]> = [
    ["blockVariant", "data-block-variant"],
    ["blockWidth", "data-block-width"],
    ["spacingTop", "data-spacing-top"],
    ["spacingBottom", "data-spacing-bottom"],
    ["blockIndent", "data-block-indent"],
    ["colorTheme", "data-color-theme"],
    ["blockBackground", "data-block-background"],
    ["blockTitle", "data-block-title"],
  ];

  dataMappings.forEach(([key, dataAttr]) => {
    const value = attrs[key];
    if (value && value !== "none" && value !== "default" && value !== "paragraph") {
      htmlAttrs[dataAttr] = value;
    }
  });

  return htmlAttrs;
}

const blockTitleAttribute: Attribute = {
  default: null,
  parseHTML: (element) => element.getAttribute("data-block-title"),
  renderHTML: (attributes) => {
    const title = attributes.blockTitle;
    if (typeof title !== "string" || title.length === 0) {
      return {};
    }

    return { "data-block-title": title };
  },
};

function createBlockTitleAttribute(): Record<string, Attribute> {
  return { blockTitle: blockTitleAttribute };
}

const blockTitleSyncKey = new PluginKey("cmsBlockTitleSync");

/**
 * Keeps `blockTitle` in sync with block type (heading level, paragraph variant).
 */
export const CmsBlockTitleSync = Extension.create({
  name: "cmsBlockTitleSync",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: blockTitleSyncKey,
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          const updates: Array<{ pos: number; attrs: Record<string, unknown> }> = [];

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== "paragraph" && node.type.name !== "heading") {
              return;
            }

            const expectedTitle = resolveBlockTitle(node.type.name, node.attrs);
            if (node.attrs.blockTitle === expectedTitle) {
              return;
            }

            updates.push({
              pos,
              attrs: { ...node.attrs, blockTitle: expectedTitle },
            });
          });

          if (updates.length === 0) {
            return null;
          }

          let tr = newState.tr;
          for (const update of updates.sort((left, right) => right.pos - left.pos)) {
            tr = tr.setNodeMarkup(update.pos, undefined, update.attrs);
          }

          return tr;
        },
      }),
    ];
  },
});

/**
 * Paragraph with CMS block-level layout and variant attributes.
 */
export const CmsParagraphBlock = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...createBlockTitleAttribute(),
      blockVariant: createDataAttribute(
        CMS_BLOCK_VARIANTS,
        "paragraph",
        "data-block-variant",
        "blockVariant",
      ),
      blockBackground: createDataAttribute(
        CMS_BLOCK_BACKGROUNDS,
        "none",
        "data-block-background",
        "blockBackground",
      ),
      ...createLayoutAttributes(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const merged = mergeBlockHtmlAttributes(node.attrs);
    const existingClass = HTMLAttributes.class as string | undefined;
    const nextClass = [existingClass, merged.class].filter(Boolean).join(" ");

    return [
      "p",
      {
        ...HTMLAttributes,
        ...merged,
        ...(nextClass ? { class: nextClass } : {}),
      },
      0,
    ];
  },
});

/**
 * Heading with CMS block-level layout attributes (no variant/background).
 */
export const CmsHeadingBlock = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...createBlockTitleAttribute(),
      ...createLayoutAttributes(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const merged = mergeBlockHtmlAttributes(node.attrs);
    const existingClass = HTMLAttributes.class as string | undefined;
    const nextClass = [existingClass, merged.class].filter(Boolean).join(" ");
    const level = node.attrs.level as number;

    return [
      `h${level}`,
      {
        ...HTMLAttributes,
        ...merged,
        ...(nextClass ? { class: nextClass } : {}),
      },
      0,
    ];
  },
});
