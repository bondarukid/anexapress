import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

const renderImage = Image.extend({
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
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt as string };
        },
      },
    };
  },
});

/**
 * Tiptap extensions used when rendering published CMS content to HTML.
 */
export const cmsRenderExtensions = [
  StarterKit.configure({
    codeBlock: false,
    horizontalRule: false,
    link: false,
    underline: false,
  }),
  renderImage,
  Link.configure({ openOnClick: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  HorizontalRule,
  Underline,
  Highlight.configure({ multicolor: true }),
  CodeBlockLowlight.configure({ lowlight }),
  Youtube.configure({
    HTMLAttributes: { class: "rounded-lg border border-border" },
  }),
];
