/**
 * Module-level scroll container for ProseMirror plugins that cannot access React context.
 */
let editorScrollContainer: HTMLElement | null = null;

export function setEditorScrollContainer(element: HTMLElement | null): void {
  editorScrollContainer = element;
}

export function getEditorScrollContainer(): HTMLElement | null {
  return editorScrollContainer;
}

/**
 * Resolves the scrollable ancestor used by the CMS editor canvas.
 */
export function resolveEditorScrollContainer(fallback: HTMLElement): HTMLElement {
  if (editorScrollContainer) {
    return editorScrollContainer;
  }

  let element: HTMLElement | null = fallback.parentElement;
  while (element) {
    const { overflowY } = window.getComputedStyle(element);
    if (overflowY === "auto" || overflowY === "scroll") {
      return element;
    }
    element = element.parentElement;
  }

  return document.documentElement;
}
