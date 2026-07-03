"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Code,
  Copy,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  List,
  Minus,
  Quote,
  Text,
  Trash2,
  Video,
} from "lucide-react";
import { useEditor } from "novel";

import { Button } from "@/components/ui/button";
import {
  getActiveTopLevelBlockPos,
  getTopLevelEditorBlocks,
  type EditorBlockTreeItem,
} from "@/lib/cms/editor-block-tree";
import {
  deleteEditorBlockAtPos,
  duplicateEditorBlockAtPos,
  moveTopLevelEditorBlock,
  selectEditorBlockAtPos,
} from "@/lib/cms/move-editor-block";
import { cn } from "@/lib/utils";

function BlockTypeIcon({ type }: { type: string }) {
  const className = "size-3.5 shrink-0 opacity-70";
  switch (type) {
    case "heading":
      return <Heading1 className={className} />;
    case "bulletList":
    case "orderedList":
    case "taskList":
    case "listItem":
    case "taskItem":
      return <List className={className} />;
    case "blockquote":
      return <Quote className={className} />;
    case "codeBlock":
      return <Code className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    case "youtube":
      return <Video className={className} />;
    case "horizontalRule":
      return <Minus className={className} />;
    default:
      return <Text className={className} />;
  }
}

type BlockRowActionsProps = {
  onDuplicate: () => void;
  onDelete: () => void;
};

function BlockRowActions({ onDuplicate, onDelete }: BlockRowActionsProps) {
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground size-7"
        aria-label="Duplicate block"
        onClick={(event) => {
          event.stopPropagation();
          onDuplicate();
        }}
      >
        <Copy className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-7"
        aria-label="Delete block"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

type BlockOutlineChildRowProps = {
  item: EditorBlockTreeItem;
  onSelect: (pos: number) => void;
};

function BlockOutlineChildRow({ item, onSelect }: BlockOutlineChildRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.pos)}
      className="hover:bg-accent flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs"
    >
      <BlockTypeIcon type={item.type} />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

type SortableBlockRowProps = {
  item: EditorBlockTreeItem;
  isActive: boolean;
  onSelect: (pos: number) => void;
  onDuplicate: (pos: number) => void;
  onDelete: (pos: number) => void;
};

function SortableBlockRow({
  item,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableBlockRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-60")}>
      <div className="group flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onSelect(item.pos)}
          className={cn(
            "hover:bg-accent flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm",
            isActive && "bg-accent",
          )}
        >
          <span
            className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </span>
          <BlockTypeIcon type={item.type} />
          <span className="truncate">{item.label}</span>
        </button>
        <BlockRowActions
          onDuplicate={() => onDuplicate(item.pos)}
          onDelete={() => onDelete(item.pos)}
        />
      </div>
      {item.children.length > 0 ? (
        <div className="border-border ml-4 border-l pl-2">
          {item.children.map((child) => (
            <BlockOutlineChildRow key={child.id} item={child} onSelect={onSelect} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Sortable top-level block outline synced with the Tiptap editor.
 */
export function BlockOutlinePanel() {
  const { editor } = useEditor();
  const [blocks, setBlocks] = useState<EditorBlockTreeItem[]>([]);
  const [activePos, setActivePos] = useState<number | null>(null);

  const refresh = useCallback(() => {
    if (!editor) return;
    const nextBlocks = getTopLevelEditorBlocks(editor.state.doc);
    setBlocks(nextBlocks);
    setActivePos(getActiveTopLevelBlockPos(editor.state.doc, editor.state.selection.anchor));
  }, [editor]);

  useEffect(() => {
    if (!editor) return undefined;

    refresh();
    editor.on("update", refresh);
    editor.on("selectionUpdate", refresh);

    return () => {
      editor.off("update", refresh);
      editor.off("selectionUpdate", refresh);
    };
  }, [editor, refresh]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!editor) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = blocks.findIndex((block) => block.id === active.id);
    const toIndex = blocks.findIndex((block) => block.id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;

    moveTopLevelEditorBlock(editor, fromIndex, toIndex);
    refresh();
  };

  const handleSelect = (pos: number) => {
    if (!editor) return;
    selectEditorBlockAtPos(editor, pos);
    refresh();
  };

  const handleDuplicate = (pos: number) => {
    if (!editor) return;
    duplicateEditorBlockAtPos(editor, pos);
    refresh();
  };

  const handleDelete = (pos: number) => {
    if (!editor) return;
    deleteEditorBlockAtPos(editor, pos);
    refresh();
  };

  if (!editor) {
    return <p className="text-muted-foreground px-2 text-xs">Loading editor…</p>;
  }

  if (blocks.length === 0) {
    return <p className="text-muted-foreground px-2 text-xs">No blocks yet</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-0.5 pb-4">
          {blocks.map((block) => (
            <SortableBlockRow
              key={block.id}
              item={block}
              isActive={activePos === block.pos}
              onSelect={handleSelect}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
