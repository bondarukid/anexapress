import "@/app/cms-content.css";

import { cmsContentTypographyClassName } from "@/lib/cms/content-typography";
import { renderTiptapHtml } from "@/lib/cms/render-tiptap-html";
import { cn } from "@/lib/utils";
import type { TiptapContent } from "@/types/tiptap";

type PostRendererProps = {
  content: TiptapContent;
  className?: string;
};

/**
 * Renders published Tiptap JSON as semantic HTML with typography styles.
 */
export function PostRenderer({ content, className }: PostRendererProps) {
  const html = renderTiptapHtml(content);

  return (
    <div
      className={cmsContentTypographyClassName(cn("cms-content", className))}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
