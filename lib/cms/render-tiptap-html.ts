import { generateHTML } from "@tiptap/html";

import { cmsRenderExtensions } from "@/lib/cms/render-extensions";
import { sanitizeTiptapContent } from "@/lib/cms/sanitize-tiptap-content";
import { EMPTY_TIPTAP_DOC } from "@/types/tiptap";

/**
 * Renders sanitized Tiptap JSON to HTML for published CMS content.
 */
export function renderTiptapHtml(content: unknown): string {
  const sanitized = sanitizeTiptapContent(content);

  try {
    return generateHTML(sanitized, cmsRenderExtensions);
  } catch {
    return generateHTML(EMPTY_TIPTAP_DOC, cmsRenderExtensions);
  }
}
