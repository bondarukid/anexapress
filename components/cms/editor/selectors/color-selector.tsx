"use client";

import { EditorBubbleItem, useEditor } from "novel";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HIGHLIGHT_COLORS = [
  { name: "Default", color: "var(--novel-highlight-default)" },
  { name: "Purple", color: "var(--novel-highlight-purple)" },
  { name: "Red", color: "var(--novel-highlight-red)" },
  { name: "Yellow", color: "var(--novel-highlight-yellow)" },
  { name: "Blue", color: "var(--novel-highlight-blue)" },
  { name: "Green", color: "var(--novel-highlight-green)" },
  { name: "Orange", color: "var(--novel-highlight-orange)" },
  { name: "Pink", color: "var(--novel-highlight-pink)" },
  { name: "Gray", color: "var(--novel-highlight-gray)" },
];

/**
 * Text highlight color picker for the bubble menu.
 */
export function ColorSelector() {
  const { editor } = useEditor();
  const [open, setOpen] = useState(false);

  if (!editor) return null;

  const activeColor = HIGHLIGHT_COLORS.find(({ color }) => editor.isActive("highlight", { color }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditorBubbleItem onSelect={() => setOpen(true)}>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
            <Palette size={16} />
            <span
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: activeColor?.color ?? "transparent" }}
            />
          </Button>
        </EditorBubbleItem>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="grid grid-cols-3 gap-2">
          {HIGHLIGHT_COLORS.map(({ name, color }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHighlight({ color }).run();
                setOpen(false);
              }}
              className={cn(
                "hover:ring-ring flex h-8 items-center justify-center rounded-md border text-xs",
                editor.isActive("highlight", { color }) && "ring-2",
              )}
              style={{ backgroundColor: color }}
              title={name}
            >
              {editor.isActive("highlight", { color }) ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            editor.chain().focus().unsetHighlight().run();
            setOpen(false);
          }}
        >
          Remove highlight
        </Button>
      </PopoverContent>
    </Popover>
  );
}
