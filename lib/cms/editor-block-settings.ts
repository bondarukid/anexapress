import type { CmsEditorInstance } from "@/types/cms-editor";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import {
  CMS_BLOCK_BACKGROUNDS,
  CMS_BLOCK_INDENTS,
  CMS_BLOCK_SPACING,
  CMS_BLOCK_VARIANTS,
  CMS_BLOCK_WIDTHS,
  CMS_COLOR_THEMES,
  type CmsBlockBackground,
  type CmsBlockIndent,
  type CmsBlockSpacing,
  type CmsBlockVariant,
  type CmsBlockWidth,
  type CmsColorTheme,
} from "@/lib/cms/editor-block-attributes";

export type TextBlockInspectorField =
  | "variant"
  | "align"
  | "width"
  | "spacingTop"
  | "spacingBottom"
  | "indent"
  | "colorTheme"
  | "background";

export type TextBlockSettings = {
  blockVariant: CmsBlockVariant;
  textAlign: "left" | "center" | "right" | "justify";
  blockWidth: CmsBlockWidth;
  spacingTop: CmsBlockSpacing;
  spacingBottom: CmsBlockSpacing;
  blockIndent: CmsBlockIndent;
  colorTheme: CmsColorTheme;
  blockBackground: CmsBlockBackground;
};

export type TextBlockSettingsPatch = Partial<TextBlockSettings>;

export type InspectorSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

const DEFAULT_SETTINGS: TextBlockSettings = {
  blockVariant: "paragraph",
  textAlign: "left",
  blockWidth: "default",
  spacingTop: "none",
  spacingBottom: "none",
  blockIndent: "none",
  colorTheme: "default",
  blockBackground: "none",
};

const FIELD_MATRIX: Record<string, TextBlockInspectorField[]> = {
  paragraph: [
    "variant",
    "align",
    "width",
    "spacingTop",
    "spacingBottom",
    "indent",
    "colorTheme",
    "background",
  ],
  heading: ["align", "width", "spacingTop", "spacingBottom", "indent", "colorTheme"],
  listItem: ["align", "indent"],
  taskItem: ["align", "indent"],
};

export const BLOCK_VARIANT_OPTIONS: InspectorSelectOption<CmsBlockVariant>[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "lead", label: "Lead" },
  { value: "muted", label: "Muted" },
  { value: "quote", label: "Quote" },
  { value: "callout", label: "Callout" },
];

export const TEXT_ALIGN_OPTIONS: InspectorSelectOption<TextBlockSettings["textAlign"]>[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

export const BLOCK_WIDTH_OPTIONS: InspectorSelectOption<CmsBlockWidth>[] = [
  { value: "default", label: "Default" },
  { value: "narrow", label: "Narrow" },
  { value: "full", label: "Full width" },
];

export const BLOCK_SPACING_OPTIONS: InspectorSelectOption<CmsBlockSpacing>[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const BLOCK_INDENT_OPTIONS: InspectorSelectOption<CmsBlockIndent>[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const COLOR_THEME_OPTIONS: InspectorSelectOption<CmsColorTheme>[] = [
  { value: "default", label: "Default" },
  { value: "muted", label: "Muted" },
  { value: "accent", label: "Accent" },
];

export const BLOCK_BACKGROUND_OPTIONS: InspectorSelectOption<CmsBlockBackground>[] = [
  { value: "none", label: "None" },
  { value: "muted", label: "Muted" },
  { value: "accent", label: "Accent" },
  { value: "warning", label: "Warning" },
];

/**
 * Returns which inspector fields are available for a given block type.
 */
export function getAvailableInspectorFields(blockType: string): TextBlockInspectorField[] {
  return FIELD_MATRIX[blockType] ?? FIELD_MATRIX.paragraph;
}

function parseTextAlign(value: unknown): TextBlockSettings["textAlign"] {
  if (value === "center" || value === "right" || value === "justify") {
    return value;
  }

  return "left";
}

function parseEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }

  return fallback;
}

/**
 * Reads block-level settings from a ProseMirror node at the given position.
 */
export function getTextBlockSettings(doc: ProseMirrorNode, blockPos: number): TextBlockSettings {
  const resolved = resolveSettingsNode(doc, blockPos);
  if (!resolved) {
    return DEFAULT_SETTINGS;
  }

  const { node } = resolved;
  const attrs = node.attrs;

  return {
    blockVariant: parseEnumValue(attrs.blockVariant, CMS_BLOCK_VARIANTS, "paragraph"),
    textAlign: parseTextAlign(attrs.textAlign),
    blockWidth: parseEnumValue(attrs.blockWidth, CMS_BLOCK_WIDTHS, "default"),
    spacingTop: parseEnumValue(attrs.spacingTop, CMS_BLOCK_SPACING, "none"),
    spacingBottom: parseEnumValue(attrs.spacingBottom, CMS_BLOCK_SPACING, "none"),
    blockIndent: parseEnumValue(attrs.blockIndent, CMS_BLOCK_INDENTS, "none"),
    colorTheme: parseEnumValue(attrs.colorTheme, CMS_COLOR_THEMES, "default"),
    blockBackground: parseEnumValue(attrs.blockBackground, CMS_BLOCK_BACKGROUNDS, "none"),
  };
}

function resolveSettingsNode(
  doc: ProseMirrorNode,
  blockPos: number,
): { node: ProseMirrorNode; pos: number } | null {
  const node = doc.nodeAt(blockPos);
  if (!node) {
    return null;
  }

  if (node.type.name === "listItem" || node.type.name === "taskItem") {
    let childPos = blockPos + 1;
    for (let index = 0; index < node.childCount; index += 1) {
      const child = node.child(index);
      if (child.type.name === "paragraph") {
        return { node: child, pos: childPos };
      }
      childPos += child.nodeSize;
    }

    return { node, pos: blockPos };
  }

  return { node, pos: blockPos };
}

/**
 * Applies block-level settings to the selected block node.
 */
export function updateTextBlockSettings(
  editor: CmsEditorInstance,
  blockPos: number,
  patch: TextBlockSettingsPatch,
): void {
  const resolved = resolveSettingsNode(editor.state.doc, blockPos);
  if (!resolved) {
    return;
  }

  const { node, pos } = resolved;
  const attrs: Record<string, string> = {};

  if (patch.blockVariant !== undefined) attrs.blockVariant = patch.blockVariant;
  if (patch.textAlign !== undefined) attrs.textAlign = patch.textAlign;
  if (patch.blockWidth !== undefined) attrs.blockWidth = patch.blockWidth;
  if (patch.spacingTop !== undefined) attrs.spacingTop = patch.spacingTop;
  if (patch.spacingBottom !== undefined) attrs.spacingBottom = patch.spacingBottom;
  if (patch.blockIndent !== undefined) attrs.blockIndent = patch.blockIndent;
  if (patch.colorTheme !== undefined) attrs.colorTheme = patch.colorTheme;
  if (patch.blockBackground !== undefined) attrs.blockBackground = patch.blockBackground;

  if (Object.keys(attrs).length === 0) {
    return;
  }

  editor.chain().setNodeSelection(pos).updateAttributes(node.type.name, attrs).run();
}
