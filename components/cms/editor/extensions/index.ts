import {
  CharacterCount,
  CodeBlockLowlight,
  Color,
  Command,
  HighlightExtension,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapLink,
  TiptapUnderline,
  UpdatedImage,
  Youtube,
  createSuggestionItems,
  getUrlFromString,
  renderItems,
} from "novel";
import { common, createLowlight } from "lowlight";
import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Text,
  Video,
} from "lucide-react";
import { createElement } from "react";

import type { Editor } from "@tiptap/core";

import TextAlign from "@tiptap/extension-text-align";

import { BlockMoveAnimation } from "@/components/cms/editor/extensions/block-move-animation";
import { CmsDragHandle } from "@/components/cms/editor/extensions/cms-drag-handle";
import {
  CmsHeadingBlock,
  CmsParagraphBlock,
} from "@/components/cms/editor/extensions/cms-paragraph-block";
import { TrailingParagraph } from "@/components/cms/editor/extensions/trailing-paragraph";
import { insertAtomBlockWithTrailingParagraph } from "@/lib/cms/editor-insert-helpers";

export type EditorExtensionOptions = {
  onImageRequest?: () => void;
};

const lowlight = createLowlight(common);

const mediaImageExtension = UpdatedImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attributes) => {
          if (!attributes.mediaId) return {};
          return { "data-media-id": attributes.mediaId as string };
        },
      },
    };
  },
}).configure({ allowBase64: false });

export function buildSuggestionItems(options: EditorExtensionOptions = {}) {
  return createSuggestionItems([
    {
      title: "Text",
      description: "Plain paragraph",
      searchTerms: ["p", "paragraph"],
      icon: createElement(Text, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
      },
    },
    {
      title: "Heading 1",
      description: "Large section heading",
      searchTerms: ["title", "big", "large"],
      icon: createElement(Heading1, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      searchTerms: ["subtitle", "medium"],
      icon: createElement(Heading2, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      searchTerms: ["subtitle", "small"],
      icon: createElement(Heading3, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Unordered list",
      searchTerms: ["unordered", "point"],
      icon: createElement(List, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Ordered list",
      searchTerms: ["ordered"],
      icon: createElement(ListOrdered, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "To-do List",
      description: "Task list with checkboxes",
      searchTerms: ["todo", "task", "checkbox"],
      icon: createElement(CheckSquare, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Quote",
      description: "Blockquote",
      searchTerms: ["blockquote"],
      icon: createElement(Quote, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code",
      description: "Code block",
      searchTerms: ["codeblock"],
      icon: createElement(Code, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Image",
      description: "Insert from media library",
      searchTerms: ["photo", "picture", "media"],
      icon: createElement(ImageIcon, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        options.onImageRequest?.();
      },
    },
    {
      title: "Youtube",
      description: "Embed a YouTube video",
      searchTerms: ["video", "youtube", "embed"],
      icon: createElement(Video, { size: 18 }),
      command: ({ editor, range }) => {
        const url = window.prompt("YouTube URL");
        const videoUrl = url ? getUrlFromString(url) : null;
        if (videoUrl) {
          editor.chain().focus().deleteRange(range).run();
          insertAtomBlockWithTrailingParagraph(editor, {
            type: "youtube",
            attrs: { src: videoUrl },
          });
        }
      },
    },
    {
      title: "Divider",
      description: "Horizontal rule",
      searchTerms: ["horizontal", "rule", "line"],
      icon: createElement(Minus, { size: 18 }),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ]);
}

export function buildSlashCommand(options: EditorExtensionOptions = {}) {
  const items = buildSuggestionItems(options);

  return Command.configure({
    suggestion: {
      items: () => items,
      render: renderItems,
    },
  });
}

export function buildEditorExtensions(options: EditorExtensionOptions = {}) {
  return [
    StarterKit.configure({
      bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
      orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
      codeBlock: false,
      horizontalRule: false,
      paragraph: false,
      heading: false,
    }),
    CmsParagraphBlock,
    CmsHeadingBlock,
    TextAlign.configure({
      types: ["paragraph", "heading"],
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: "left",
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return `Heading ${node.attrs.level}`;
        }
        return "Press '/' for commands, or start writing…";
      },
      includeChildren: true,
      showOnlyCurrent: false,
    }),
    TiptapLink.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-primary underline underline-offset-4" },
    }),
    mediaImageExtension,
    TaskList.configure({ HTMLAttributes: { class: "not-prose pl-2" } }),
    TaskItem.configure({
      HTMLAttributes: { class: "flex items-start gap-2" },
      nested: true,
    }),
    HorizontalRule,
    TiptapUnderline,
    TextStyle,
    Color,
    HighlightExtension.configure({ multicolor: true }),
    CodeBlockLowlight.configure({ lowlight }),
    Youtube.configure({
      HTMLAttributes: { class: "rounded-lg border border-border" },
    }),
    CharacterCount.configure(),
    CmsDragHandle,
    BlockMoveAnimation,
    TrailingParagraph,
    buildSlashCommand(options),
  ];
}

/** @deprecated Use buildEditorExtensions() for per-instance options. */
export const editorExtensions = buildEditorExtensions();

/** @deprecated Use buildSuggestionItems() for per-instance options. */
export const suggestionItems = buildSuggestionItems();

export type { Editor };
