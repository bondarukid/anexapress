import { Extension } from "@tiptap/core";
import { Fragment, Slice } from "@tiptap/pm/model";
import { NodeSelection, Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import * as pmView from "@tiptap/pm/view";

import { resolveEditorScrollContainer } from "@/lib/cms/editor-scroll-container";

type DragHandlePluginOptions = {
  pluginKey: string;
  dragHandleWidth: number;
  scrollTreshold: number;
  dragHandleSelector?: string;
  excludedTags: string[];
  customNodes: string[];
};

function getPmView(): typeof pmView | null {
  try {
    return pmView;
  } catch {
    return null;
  }
}

function serializeForClipboard(
  view: EditorView,
  slice: Slice,
): { dom: HTMLElement; text: string } {
  if (typeof view.serializeForClipboard === "function") {
    return view.serializeForClipboard(slice);
  }

  const proseMirrorView = getPmView();
  const legacySerialize = (
    proseMirrorView as unknown as {
      __serializeForClipboard?: (v: EditorView, s: Slice) => { dom: HTMLElement; text: string };
    }
  ).__serializeForClipboard;

  if (typeof legacySerialize === "function") {
    return legacySerialize(view, slice);
  }

  throw new Error("No supported clipboard serialization method found.");
}

function absoluteRect(node: Element): { top: number; left: number; width: number } {
  const data = node.getBoundingClientRect();
  const modal = node.closest('[role="dialog"]');
  if (modal && window.getComputedStyle(modal).transform !== "none") {
    const modalRect = modal.getBoundingClientRect();
    return {
      top: data.top - modalRect.top,
      left: data.left - modalRect.left,
      width: data.width,
    };
  }

  return {
    top: data.top,
    left: data.left,
    width: data.width,
  };
}

function buildBlockSelectors(customNodes: string[]): string {
  return [
    "p",
    "li",
    "pre",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "hr",
    "div[data-youtube-video]",
    ...customNodes.map((node) => `[data-type=${node}]`),
  ].join(", ");
}

function nodeDOMAtCoords(
  coords: { x: number; y: number },
  options: DragHandlePluginOptions,
): Element | undefined {
  const selectors = buildBlockSelectors(options.customNodes);
  return document
    .elementsFromPoint(coords.x, coords.y)
    .find(
      (elem) =>
        elem.parentElement?.matches?.(".ProseMirror") || elem.matches(selectors),
    );
}

function nodePosAtDOM(
  node: Element,
  view: EditorView,
  options: DragHandlePluginOptions,
): number | undefined {
  const boundingRect = node.getBoundingClientRect();
  return view.posAtCoords({
    left: boundingRect.left + 50 + options.dragHandleWidth,
    top: boundingRect.top + 1,
  })?.inside;
}

function calcNodePos(pos: number, view: EditorView): number {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth > 1) {
    return $pos.before($pos.depth);
  }
  return pos;
}

function DragHandlePlugin(options: DragHandlePluginOptions): Plugin {
  let listType = "";
  let isHandleDragging = false;
  let lastPointer: { x: number; y: number } | null = null;
  let dragHandleElement: HTMLDivElement | null = null;

  function hideDragHandle(): void {
    dragHandleElement?.classList.add("hide");
  }

  function showDragHandle(): void {
    dragHandleElement?.classList.remove("hide");
  }

  function positionDragHandle(node: Element): void {
    if (!dragHandleElement) return;

    const compStyle = window.getComputedStyle(node);
    const parsedLineHeight = Number.parseInt(compStyle.lineHeight, 10);
    const lineHeight = Number.isNaN(parsedLineHeight)
      ? Number.parseInt(compStyle.fontSize, 10) * 1.2
      : parsedLineHeight;
    const paddingTop = Number.parseInt(compStyle.paddingTop, 10);
    const rect = absoluteRect(node);
    rect.top += (lineHeight - 24) / 2;
    rect.top += Number.isNaN(paddingTop) ? 0 : paddingTop;

    if (node.matches("ul:not([data-type=taskList]) li, ol li")) {
      rect.left -= options.dragHandleWidth;
    }

    rect.width = options.dragHandleWidth;
    dragHandleElement.style.left = `${rect.left - rect.width}px`;
    dragHandleElement.style.top = `${rect.top}px`;
    showDragHandle();
  }

  function handleDragStart(event: DragEvent, view: EditorView): void {
    view.focus();
    if (!event.dataTransfer) return;

    const node = nodeDOMAtCoords(
      {
        x: event.clientX + 50 + options.dragHandleWidth,
        y: event.clientY,
      },
      options,
    );

    if (!(node instanceof Element)) return;

    let draggedNodePos = nodePosAtDOM(node, view, options);
    if (draggedNodePos === undefined || draggedNodePos < 0) return;

    draggedNodePos = calcNodePos(draggedNodePos, view);
    const { from, to } = view.state.selection;
    const diff = from - to;
    const fromSelectionPos = calcNodePos(from, view);
    let differentNodeSelected = false;
    const nodePos = view.state.doc.resolve(fromSelectionPos);

    if (nodePos.node().type.name === "doc") {
      differentNodeSelected = true;
    } else {
      const nodeSelection = NodeSelection.create(view.state.doc, nodePos.before());
      differentNodeSelected = !(
        draggedNodePos + 1 >= nodeSelection.$from.pos && draggedNodePos <= nodeSelection.$to.pos
      );
    }

    let selection = view.state.selection;
    if (
      !differentNodeSelected &&
      diff !== 0 &&
      !(view.state.selection instanceof NodeSelection)
    ) {
      const endSelection = NodeSelection.create(view.state.doc, to - 1);
      selection = TextSelection.create(view.state.doc, draggedNodePos, endSelection.$to.pos);
    } else {
      let nodeSelection = NodeSelection.create(view.state.doc, draggedNodePos);
      if (nodeSelection.node.type.isInline || nodeSelection.node.type.name === "tableRow") {
        const $pos = view.state.doc.resolve(nodeSelection.from);
        nodeSelection = NodeSelection.create(view.state.doc, $pos.before());
      }
      selection = nodeSelection;
    }

    view.dispatch(view.state.tr.setSelection(selection));

    if (
      view.state.selection instanceof NodeSelection &&
      view.state.selection.node.type.name === "listItem"
    ) {
      listType = node.parentElement?.tagName ?? "";
    }

    const slice = view.state.selection.content();
    const { dom, text } = serializeForClipboard(view, slice);
    event.dataTransfer.clearData();
    event.dataTransfer.setData("text/html", dom.innerHTML);
    event.dataTransfer.setData("text/plain", text);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setDragImage(node, 0, 0);
    view.dragging = { slice, move: event.ctrlKey };
    isHandleDragging = true;
  }

  function hideHandleOnEditorOut(event: MouseEvent): void {
    if (event.target instanceof Element) {
      const relatedTarget = event.relatedTarget;
      const isInsideEditor =
        relatedTarget instanceof Element &&
        (relatedTarget.classList.contains("tiptap") ||
          relatedTarget.classList.contains("drag-handle"));
      if (isInsideEditor) return;
    }
    hideDragHandle();
  }

  return new Plugin({
    key: new PluginKey(options.pluginKey),
    view: (view) => {
      const handleBySelector = options.dragHandleSelector
        ? document.querySelector<HTMLDivElement>(options.dragHandleSelector)
        : null;

      dragHandleElement = handleBySelector ?? document.createElement("div");
      dragHandleElement.draggable = true;
      dragHandleElement.dataset.dragHandle = "";
      dragHandleElement.classList.add("drag-handle");

      const onDragHandleDragStart = (event: DragEvent) => {
        handleDragStart(event, view);
      };

      const onDragHandleDrag = (event: DragEvent) => {
        hideDragHandle();
        const scrollContainer = resolveEditorScrollContainer(view.dom);
        const rect = scrollContainer.getBoundingClientRect();

        if (event.clientY < rect.top + options.scrollTreshold) {
          scrollContainer.scrollTop -= 30;
        } else if (event.clientY > rect.bottom - options.scrollTreshold) {
          scrollContainer.scrollTop += 30;
        }
      };

      const onDragHandleDragEnd = () => {
        isHandleDragging = false;
      };

      dragHandleElement.addEventListener("dragstart", onDragHandleDragStart);
      dragHandleElement.addEventListener("drag", onDragHandleDrag);
      dragHandleElement.addEventListener("dragend", onDragHandleDragEnd);
      hideDragHandle();

      if (!handleBySelector) {
        view.dom.parentElement?.appendChild(dragHandleElement);
      }

      view.dom.parentElement?.addEventListener("mouseout", hideHandleOnEditorOut);

      const scrollContainer = resolveEditorScrollContainer(view.dom);
      const onScroll = () => {
        if (!lastPointer || !dragHandleElement) return;
        const node = nodeDOMAtCoords(
          {
            x: lastPointer.x + 50 + options.dragHandleWidth,
            y: lastPointer.y,
          },
          options,
        );
        if (node instanceof Element) {
          positionDragHandle(node);
        } else {
          hideDragHandle();
        }
      };
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });

      return {
        destroy: () => {
          if (!handleBySelector) {
            dragHandleElement?.remove();
          }
          dragHandleElement?.removeEventListener("dragstart", onDragHandleDragStart);
          dragHandleElement?.removeEventListener("drag", onDragHandleDrag);
          dragHandleElement?.removeEventListener("dragend", onDragHandleDragEnd);
          scrollContainer.removeEventListener("scroll", onScroll);
          dragHandleElement = null;
          view.dom.parentElement?.removeEventListener("mouseout", hideHandleOnEditorOut);
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousemove: (view, event) => {
          if (!view.editable) return false;

          lastPointer = { x: event.clientX, y: event.clientY };
          const node = nodeDOMAtCoords(
            {
              x: event.clientX + 50 + options.dragHandleWidth,
              y: event.clientY,
            },
            options,
          );

          const notDragging = node?.closest(".not-draggable");
          const excludedTagList = options.excludedTags.concat(["ol", "ul"]).join(", ");

          if (!(node instanceof Element) || node.matches(excludedTagList) || notDragging) {
            hideDragHandle();
            return false;
          }

          positionDragHandle(node);
          return false;
        },
        keydown: () => {
          hideDragHandle();
          return false;
        },
        mousewheel: (view) => {
          if (!isHandleDragging && !view.dom.classList.contains("dragging")) {
            hideDragHandle();
          }
          return false;
        },
        dragstart: (view) => {
          view.dom.classList.add("dragging");
          return false;
        },
        drop: (view, event) => {
          view.dom.classList.remove("dragging");
          isHandleDragging = false;
          hideDragHandle();

          const dropPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (!dropPos) return false;

          let droppedNode = null;
          if (view.state.selection instanceof NodeSelection) {
            droppedNode = view.state.selection.node;
          }
          if (!droppedNode) return false;

          const resolvedPos = view.state.doc.resolve(dropPos.pos);
          const isDroppedInsideList = resolvedPos.parent.type.name === "listItem";

          if (
            view.state.selection instanceof NodeSelection &&
            view.state.selection.node.type.name === "listItem" &&
            !isDroppedInsideList &&
            listType === "OL"
          ) {
            const newList = view.state.schema.nodes.orderedList?.createAndFill(null, droppedNode);
            if (newList) {
              const slice = new Slice(Fragment.from(newList), 0, 0);
              view.dragging = { slice, move: event.ctrlKey };
            }
          }

          return false;
        },
        dragend: (view) => {
          view.dom.classList.remove("dragging");
          isHandleDragging = false;
          return false;
        },
      },
    },
  });
}

/**
 * CMS drag handle with support for images, YouTube embeds, first paragraph,
 * and scrollable editor containers.
 */
export const CmsDragHandle = Extension.create({
  name: "cmsDragHandle",

  addOptions() {
    return {
      dragHandleWidth: 20,
      scrollTreshold: 100,
      excludedTags: [] as string[],
      customNodes: [] as string[],
      dragHandleSelector: undefined as string | undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      DragHandlePlugin({
        pluginKey: "cmsDragHandle",
        dragHandleWidth: this.options.dragHandleWidth,
        scrollTreshold: this.options.scrollTreshold,
        dragHandleSelector: this.options.dragHandleSelector,
        excludedTags: this.options.excludedTags,
        customNodes: this.options.customNodes,
      }),
    ];
  },
});
