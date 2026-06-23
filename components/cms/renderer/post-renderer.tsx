import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { generateHTML } from "@tiptap/html";

import type { TiptapContent } from "@/types/tiptap";

const renderExtensions = [
  StarterKit,
  Image,
  Link.configure({ openOnClick: true }),
];

type PostRendererProps = {
  content: TiptapContent;
  className?: string;
};

/**
 * Renders published Tiptap JSON as semantic HTML with typography styles.
 */
export function PostRenderer({ content, className }: PostRendererProps) {
  const html = generateHTML(content, renderExtensions);

  return (
    <article
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
