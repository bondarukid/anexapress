"use client";

import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";
import { cn } from "@/lib/utils";

type EditorDocumentTitleFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

/**
 * Document title field rendered inside the inspector provider tree.
 * Clears block selection so document settings stay visible while editing the title.
 */
export function EditorDocumentTitleField({
  value,
  onChange,
  placeholder,
  className,
}: EditorDocumentTitleFieldProps) {
  const { clearSelectedBlock } = useEditorInspector();

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={clearSelectedBlock}
      placeholder={placeholder}
      className={cn(
        "placeholder:text-muted-foreground/60 w-full border-0 bg-transparent text-3xl font-bold tracking-tight outline-none sm:text-4xl",
        className,
      )}
    />
  );
}
