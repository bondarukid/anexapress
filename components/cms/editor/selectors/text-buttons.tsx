"use client";

import { EditorBubbleItem, useEditor } from "novel";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Inline formatting controls shown in the bubble menu.
 */
export function TextButtons() {
  const { editor } = useEditor();
  if (!editor) return null;

  const items = [
    {
      name: "bold",
      icon: Bold,
      isActive: editor.isActive("bold"),
      command: () => editor.chain().focus().toggleBold().run(),
    },
    {
      name: "italic",
      icon: Italic,
      isActive: editor.isActive("italic"),
      command: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      name: "underline",
      icon: Underline,
      isActive: editor.isActive("underline"),
      command: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      name: "strike",
      icon: Strikethrough,
      isActive: editor.isActive("strike"),
      command: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      name: "code",
      icon: Code,
      isActive: editor.isActive("code"),
      command: () => editor.chain().focus().toggleCode().run(),
    },
  ];

  return (
    <div className="flex items-center">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={() => {
            item.command();
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", item.isActive && "bg-accent")}
          >
            <item.icon size={16} />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
}
