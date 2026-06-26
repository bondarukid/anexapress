"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CmsEditorInstance } from "@/types/cms-editor";

import { InspectorSection } from "@/components/cms/editor/inspector/inspector-section";
import {
  InspectorFieldGroup,
  InspectorSelectField,
} from "@/components/cms/editor/inspector/inspector-select-field";
import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";
import { Input } from "@/components/ui/input";
import { getEditorBlockName, setEditorBlockName } from "@/lib/cms/editor-block-name";
import {
  BLOCK_BACKGROUND_OPTIONS,
  BLOCK_INDENT_OPTIONS,
  BLOCK_SPACING_OPTIONS,
  BLOCK_VARIANT_OPTIONS,
  BLOCK_WIDTH_OPTIONS,
  COLOR_THEME_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  getAvailableInspectorFields,
  getTextBlockSettings,
  updateTextBlockSettings,
  type TextBlockInspectorField,
  type TextBlockSettings,
} from "@/lib/cms/editor-block-settings";
import type { EditorBlockSelection } from "@/lib/cms/editor-selection";

type TextBlockInspectorPanelProps = {
  block: EditorBlockSelection;
};

function useEditorRevision(editor: CmsEditorInstance | null): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!editor) return undefined;

    const bump = () => {
      setRevision((value) => value + 1);
    };

    editor.on("selectionUpdate", bump);
    editor.on("transaction", bump);

    return () => {
      editor.off("selectionUpdate", bump);
      editor.off("transaction", bump);
    };
  }, [editor]);

  return revision;
}

function hasField(fields: TextBlockInspectorField[], field: TextBlockInspectorField): boolean {
  return fields.includes(field);
}

/**
 * Block-level inspector for paragraph, heading, and list text blocks.
 */
export function TextBlockInspectorPanel({ block }: TextBlockInspectorPanelProps) {
  const { editor } = useEditorInspector();
  const revision = useEditorRevision(editor);
  const [blockName, setBlockName] = useState("");
  const isEditingNameRef = useRef(false);

  const availableFields = useMemo(
    () => getAvailableInspectorFields(block.type),
    [block.type],
  );

  const settings = useMemo(() => {
    if (!editor) {
      return null;
    }

    void revision;
    return getTextBlockSettings(editor.state.doc, block.pos);
  }, [block.pos, editor, revision]);

  useEffect(() => {
    if (!editor || isEditingNameRef.current) return;
    setBlockName(getEditorBlockName(editor.state.doc, block.pos));
  }, [block.pos, editor, revision]);

  if (!editor || !settings) {
    return (
      <p className="text-muted-foreground px-1 py-2 text-xs">
        Editor is loading…
      </p>
    );
  }

  const patchSettings = (patch: Partial<TextBlockSettings>) => {
    updateTextBlockSettings(editor, block.pos, patch);
  };

  const applyBlockName = () => {
    const trimmed = blockName.trim();
    const current = getEditorBlockName(editor.state.doc, block.pos);

    if (trimmed === current) {
      return;
    }

    setEditorBlockName(editor, block.pos, trimmed);
  };

  return (
    <div className="space-y-3 px-1 py-1 pb-4">
      <InspectorSection
        title="Block name"
        help="The label shown in the block outline and the main text content of this block. Changing it updates the text inside the block."
      >
        <Input
          value={blockName}
          onChange={(event) => setBlockName(event.target.value)}
          onFocus={() => {
            isEditingNameRef.current = true;
          }}
          onBlur={() => {
            isEditingNameRef.current = false;
            applyBlockName();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          placeholder="Enter block name"
        />
      </InspectorSection>

      {(hasField(availableFields, "variant") ||
        hasField(availableFields, "align") ||
        hasField(availableFields, "width")) && (
        <InspectorFieldGroup
          title="Layout"
          help="Block-level layout settings that apply to the entire text block, not individual words."
        >
          {hasField(availableFields, "variant") && (
            <InspectorSelectField
              label="Style variant"
              help="Visual style for the whole block: lead text, muted, quote, or callout."
              value={settings.blockVariant}
              options={BLOCK_VARIANT_OPTIONS}
              onValueChange={(blockVariant) => patchSettings({ blockVariant })}
            />
          )}
          {hasField(availableFields, "align") && (
            <InspectorSelectField
              label="Text align"
              help="Horizontal alignment for all text in this block."
              value={settings.textAlign}
              options={TEXT_ALIGN_OPTIONS}
              onValueChange={(textAlign) => patchSettings({ textAlign })}
            />
          )}
          {hasField(availableFields, "width") && (
            <InspectorSelectField
              label="Width"
              help="How wide the block spans inside the content area."
              value={settings.blockWidth}
              options={BLOCK_WIDTH_OPTIONS}
              onValueChange={(blockWidth) => patchSettings({ blockWidth })}
            />
          )}
        </InspectorFieldGroup>
      )}

      {(hasField(availableFields, "spacingTop") ||
        hasField(availableFields, "spacingBottom") ||
        hasField(availableFields, "indent")) && (
        <InspectorFieldGroup
          title="Spacing"
          help="Vertical spacing and horizontal indent for the block as a whole."
        >
          {hasField(availableFields, "spacingTop") && (
            <InspectorSelectField
              label="Space before"
              help="Extra margin above this block."
              value={settings.spacingTop}
              options={BLOCK_SPACING_OPTIONS}
              onValueChange={(spacingTop) => patchSettings({ spacingTop })}
            />
          )}
          {hasField(availableFields, "spacingBottom") && (
            <InspectorSelectField
              label="Space after"
              help="Extra margin below this block."
              value={settings.spacingBottom}
              options={BLOCK_SPACING_OPTIONS}
              onValueChange={(spacingBottom) => patchSettings({ spacingBottom })}
            />
          )}
          {hasField(availableFields, "indent") && (
            <InspectorSelectField
              label="Indent"
              help="Horizontal inset for the entire block."
              value={settings.blockIndent}
              options={BLOCK_INDENT_OPTIONS}
              onValueChange={(blockIndent) => patchSettings({ blockIndent })}
            />
          )}
        </InspectorFieldGroup>
      )}

      {(hasField(availableFields, "colorTheme") || hasField(availableFields, "background")) && (
        <InspectorFieldGroup
          title="Appearance"
          help="Block-level color and background. Inline word colors stay in the text toolbar."
        >
          {hasField(availableFields, "colorTheme") && (
            <InspectorSelectField
              label="Text color"
              help="Foreground color for the entire block."
              value={settings.colorTheme}
              options={COLOR_THEME_OPTIONS}
              onValueChange={(colorTheme) => patchSettings({ colorTheme })}
            />
          )}
          {hasField(availableFields, "background") && (
            <InspectorSelectField
              label="Background"
              help="Background fill for callout-like blocks."
              value={settings.blockBackground}
              options={BLOCK_BACKGROUND_OPTIONS}
              onValueChange={(blockBackground) => patchSettings({ blockBackground })}
            />
          )}
        </InspectorFieldGroup>
      )}
    </div>
  );
}
