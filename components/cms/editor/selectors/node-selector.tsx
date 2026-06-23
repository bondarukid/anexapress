"use client";

import { useEditor } from "novel";
import {
  CheckSquare,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Text,
} from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NodeItem = {
  name: string;
  label: string;
  icon: React.ReactNode;
  isActive: (editor: NonNullable<ReturnType<typeof useEditor>["editor"]>) => boolean;
  command: (editor: NonNullable<ReturnType<typeof useEditor>["editor"]>) => void;
};

/**
 * Bubble menu control for switching the current block type.
 */
export function NodeSelector() {
  const { editor } = useEditor();

  const items = useMemo<NodeItem[]>(
    () => [
      {
        name: "Text",
        label: "Text",
        icon: <Text size={16} />,
        isActive: (instance) =>
          instance.isActive("paragraph") &&
          !instance.isActive("bulletList") &&
          !instance.isActive("orderedList") &&
          !instance.isActive("taskList"),
        command: (instance) => instance.chain().focus().setParagraph().run(),
      },
      {
        name: "Heading 1",
        label: "Heading 1",
        icon: <Heading1 size={16} />,
        isActive: (instance) => instance.isActive("heading", { level: 1 }),
        command: (instance) => instance.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        name: "Heading 2",
        label: "Heading 2",
        icon: <Heading2 size={16} />,
        isActive: (instance) => instance.isActive("heading", { level: 2 }),
        command: (instance) => instance.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        name: "Heading 3",
        label: "Heading 3",
        icon: <Heading3 size={16} />,
        isActive: (instance) => instance.isActive("heading", { level: 3 }),
        command: (instance) => instance.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        name: "Bullet List",
        label: "Bullet list",
        icon: <List size={16} />,
        isActive: (instance) => instance.isActive("bulletList"),
        command: (instance) => instance.chain().focus().toggleBulletList().run(),
      },
      {
        name: "Numbered List",
        label: "Numbered list",
        icon: <ListOrdered size={16} />,
        isActive: (instance) => instance.isActive("orderedList"),
        command: (instance) => instance.chain().focus().toggleOrderedList().run(),
      },
      {
        name: "To-do List",
        label: "To-do list",
        icon: <CheckSquare size={16} />,
        isActive: (instance) => instance.isActive("taskList"),
        command: (instance) => instance.chain().focus().toggleTaskList().run(),
      },
      {
        name: "Quote",
        label: "Quote",
        icon: <Quote size={16} />,
        isActive: (instance) => instance.isActive("blockquote"),
        command: (instance) => instance.chain().focus().toggleBlockquote().run(),
      },
    ],
    [],
  );

  if (!editor) return null;

  const activeItem = items.find((item) => item.isActive(editor)) ?? items[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2">
          {activeItem.icon}
          <span className="text-xs">{activeItem.label}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1" align="start">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => item.command(editor)}
            className={cn(
              "hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
              item.isActive(editor) && "bg-accent",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
