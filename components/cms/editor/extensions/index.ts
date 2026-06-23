import {
  Command,
  Placeholder,
  StarterKit,
  TiptapImage,
  TiptapLink,
  HorizontalRule,
  createSuggestionItems,
  renderItems,
} from "novel";
import { type Editor } from "@tiptap/core";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  Image as ImageIcon,
  Minus,
} from "lucide-react";
import { createElement } from "react";

export const suggestionItems = createSuggestionItems([
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
    title: "Image",
    description: "Insert an image",
    searchTerms: ["photo", "picture", "media"],
    icon: createElement(ImageIcon, { size: 18 }),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const url = window.prompt("Image URL");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
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

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

export const editorExtensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
    orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Press '/' for commands, or start writing…";
    },
    includeChildren: true,
  }),
  TiptapLink.configure({ openOnClick: false }),
  TiptapImage.extend({
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
  }).configure({ allowBase64: false }),
  HorizontalRule,
  slashCommand,
];

export type { Editor };
