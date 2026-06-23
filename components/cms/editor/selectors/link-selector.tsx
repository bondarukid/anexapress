"use client";

import { EditorBubbleItem, useEditor } from "novel";
import { Check, Link as LinkIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Bubble menu link editor with set and remove actions.
 */
export function LinkSelector() {
  const { editor } = useEditor();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!editor) return;
    const href = editor.getAttributes("link").href as string | undefined;
    setUrl(href ?? "");
  }, [editor, open]);

  if (!editor) return null;

  const isActive = editor.isActive("link");

  const applyLink = () => {
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setOpen(false);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setUrl("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditorBubbleItem
          onSelect={() => {
            setOpen(true);
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", isActive && "bg-accent")}
          >
            <LinkIcon size={16} />
          </Button>
        </EditorBubbleItem>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            {isActive ? (
              <Button variant="ghost" size="sm" onClick={removeLink}>
                <Trash2 size={14} />
                Remove
              </Button>
            ) : null}
            <Button size="sm" onClick={applyLink}>
              <Check size={14} />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
