"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JSONContent } from "novel";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
} from "novel";

import { editorExtensions, suggestionItems } from "@/components/cms/editor/extensions";
import { cn } from "@/lib/utils";
import type { TiptapContent } from "@/types/tiptap";

type PostEditorProps = {
  initialContent: TiptapContent;
  onChange: (content: TiptapContent) => void;
  className?: string;
};

/**
 * Novel/Tiptap block editor for post body content.
 */
export function PostEditor({ initialContent, onChange, className }: PostEditorProps) {
  const [content] = useState<TiptapContent>(initialContent);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleUpdate = useCallback(({ editor }: { editor: { getJSON: () => JSONContent } }) => {
    onChangeRef.current(editor.getJSON() as TiptapContent);
  }, []);

  return (
    <EditorRoot>
      <EditorContent
        className={cn(
          "prose prose-neutral dark:prose-invert max-w-none min-h-[60vh] w-full px-8 py-6 focus:outline-none",
          className,
        )}
        extensions={editorExtensions}
        initialContent={content as JSONContent}
        onUpdate={handleUpdate}
        editorProps={{
          attributes: {
            class:
              "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[60vh]",
          },
        }}
      >
        <EditorCommand className="border-border bg-background z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border px-1 py-2 shadow-md">
          <EditorCommandEmpty className="text-muted-foreground px-2">No results</EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                onCommand={item.command ?? (() => undefined)}
                className="hover:bg-accent aria-selected:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
              >
                <div className="border-border bg-background flex h-10 w-10 items-center justify-center rounded-md border">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
      </EditorContent>
    </EditorRoot>
  );
}
