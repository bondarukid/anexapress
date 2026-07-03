import { Fragment, Slice, type Node as ProseMirrorNode } from "@tiptap/pm/model";

const STRIPPED_STYLE_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "font-size",
  "font-family",
  "font",
  "line-height",
  "letter-spacing",
  "-webkit-text-fill-color",
]);

const PASTE_ALLOWED_MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);

function shouldStripStyleProperty(property: string): boolean {
  const normalized = property.trim().toLowerCase();
  if (STRIPPED_STYLE_PROPS.has(normalized)) return true;
  return normalized.startsWith("mso-");
}

function cleanStyleAttribute(style: string): string {
  return style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const property = part.split(":")[0] ?? "";
      return !shouldStripStyleProperty(property);
    })
    .join("; ");
}

function unwrapLegacyFontElements(root: ParentNode): void {
  root.querySelectorAll("font").forEach((fontEl) => {
    const parent = fontEl.parentNode;
    if (!parent) return;
    while (fontEl.firstChild) {
      parent.insertBefore(fontEl.firstChild, fontEl);
    }
    parent.removeChild(fontEl);
  });
}

function stripElementFormatting(root: ParentNode): void {
  root.querySelectorAll("*").forEach((el) => {
    if (el.hasAttribute("style")) {
      const cleaned = cleanStyleAttribute(el.getAttribute("style") ?? "");
      if (cleaned) {
        el.setAttribute("style", cleaned);
      } else {
        el.removeAttribute("style");
      }
    }

    el.removeAttribute("color");
    el.removeAttribute("face");
    el.removeAttribute("size");
  });

  unwrapLegacyFontElements(root);
}

/**
 * Removes foreign inline typography from pasted HTML before ProseMirror parses it.
 * Structure (lists, quotes, paragraphs) is preserved; bold/italic/link marks may remain.
 */
export function stripPastedHtmlFormatting(html: string): string {
  if (!html.trim() || typeof document === "undefined") {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, meta, link, script").forEach((node) => node.remove());
  stripElementFormatting(doc.body);
  return doc.body.innerHTML;
}

function stripMarksFromFragment(fragment: Fragment): Fragment {
  const nodes: ProseMirrorNode[] = [];

  fragment.forEach((node) => {
    if (node.isText) {
      const marks = node.marks.filter((mark) => PASTE_ALLOWED_MARKS.has(mark.type.name));
      nodes.push(marks.length === node.marks.length ? node : node.mark(marks));
      return;
    }

    if (node.content.size > 0) {
      nodes.push(node.copy(stripMarksFromFragment(node.content)));
      return;
    }

    nodes.push(node);
  });

  return Fragment.fromArray(nodes);
}

/**
 * Strips color/highlight/textStyle marks from a pasted ProseMirror slice.
 */
export function stripPastedSliceMarks(slice: Slice): Slice {
  return new Slice(stripMarksFromFragment(slice.content), slice.openStart, slice.openEnd);
}
