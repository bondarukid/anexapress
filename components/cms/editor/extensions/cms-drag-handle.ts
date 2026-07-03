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

const HANDLE_OFFSET_PX = 4;

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

function buildBlockSelectors(customNodes: string[]): string {
  return [
    "p",
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
    "ul",
    "ol",
    "div[data-youtube-video]",
    ...customNodes.map((node) => `[data-type=${node}]`),
  ].join(", ");
}

const ATOM_BLOCK_SELECTORS = "img, hr, div[data-youtube-video]";

function isAtomBlockType(typeName: string): boolean {
  return typeName === "image" || typeName === "youtube" || typeName === "horizontalRule";
}

function isListBlockType(typeName: string): boolean {
  return typeName === "bulletList" || typeName === "orderedList" || typeName === "taskList";
}

function resolveDomForTopLevelNode(
  view: EditorView,
  topLevelPos: number,
  selectors: string,
): Element | null {
  let dom: Node | null = view.nodeDOM(topLevelPos);
  if (dom instanceof Text) {
    dom = dom.parentNode;
  }

  if (dom instanceof Element && dom.matches(selectors)) {
    return dom;
  }

  const domAtPos = view.domAtPos(topLevelPos + 1);
  let element: Element | null =
    domAtPos.node instanceof Element ? domAtPos.node : domAtPos.node.parentElement;

  while (element && element !== view.dom) {
    if (element.parentElement === view.dom && element.matches(selectors)) {
      return element;
    }
    element = element.parentElement;
  }

  const childIndex = view.state.doc.resolve(topLevelPos + 1).index(0);
  const domChild = view.dom.children.item(childIndex);
  if (domChild instanceof Element && domChild.matches(selectors)) {
    return domChild;
  }

  return null;
}

function getTopLevelBlockElement(
  view: EditorView,
  pos: number,
  options: DragHandlePluginOptions,
): Element | null {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth < 1) {
    return null;
  }

  const topLevelNode = $pos.node(1);
  const topLevelType = topLevelNode.type.name;
  const topLevelPos = $pos.before(1);

  if (isListBlockType(topLevelType)) {
    return resolveDomForTopLevelNode(view, topLevelPos, "ul, ol");
  }

  if (topLevelType === "image") {
    return resolveDomForTopLevelNode(view, topLevelPos, "img");
  }

  if (topLevelType === "youtube") {
    return resolveDomForTopLevelNode(view, topLevelPos, "div[data-youtube-video]");
  }

  return resolveDomForTopLevelNode(view, topLevelPos, buildBlockSelectors(options.customNodes));
}

function getVerticalAnchor(node: Element, pointerY?: number): Element {
  if (node.matches(ATOM_BLOCK_SELECTORS)) {
    return node;
  }

  if (node.matches("ul, ol")) {
    const listItems = node.querySelectorAll(":scope > li");

    if (pointerY !== undefined) {
      for (const item of listItems) {
        const itemRect = item.getBoundingClientRect();
        if (pointerY >= itemRect.top && pointerY <= itemRect.bottom) {
          const paragraph =
            item.querySelector(":scope > p") ?? item.querySelector(":scope > div > p");
          return paragraph instanceof HTMLElement ? paragraph : item;
        }
      }
    }

    const firstItem = listItems[0];
    if (firstItem) {
      const paragraph =
        firstItem.querySelector(":scope > p") ?? firstItem.querySelector(":scope > div > p");
      return paragraph instanceof HTMLElement ? paragraph : firstItem;
    }
  }

  if (node.matches("blockquote")) {
    const paragraph = node.querySelector(":scope > p");
    if (paragraph instanceof HTMLElement) {
      return paragraph;
    }
  }

  return node;
}

function findTopLevelBlockFromTarget(
  view: EditorView,
  target: Element,
  options: DragHandlePluginOptions,
): Element | null {
  if (!view.dom.contains(target)) {
    return null;
  }

  const blockSelectors = buildBlockSelectors(options.customNodes);

  const atomBlock = target.closest(ATOM_BLOCK_SELECTORS);
  if (atomBlock instanceof Element && view.dom.contains(atomBlock)) {
    return atomBlock;
  }

  const listContainer = target.closest("ul, ol");
  if (listContainer instanceof Element) {
    return listContainer;
  }

  let current: Element | null = target;
  while (current && current !== view.dom) {
    if (current.parentElement === view.dom && current.matches(blockSelectors)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

function blockFromPointerAt(
  view: EditorView,
  clientX: number,
  clientY: number,
  options: DragHandlePluginOptions,
): Element | null {
  const proseMirrorRect = view.dom.getBoundingClientRect();

  if (
    clientY < proseMirrorRect.top ||
    clientY > proseMirrorRect.bottom ||
    clientX < proseMirrorRect.left
  ) {
    return null;
  }

  const clampedX = Math.min(clientX, proseMirrorRect.right - 1);
  const elements = document.elementsFromPoint(clampedX, clientY);
  for (const element of elements) {
    if (!(element instanceof Element)) {
      continue;
    }

    const block = findTopLevelBlockFromTarget(view, element, options);
    if (block) {
      return block;
    }
  }

  const coords = view.posAtCoords({ left: clampedX, top: clientY });
  if (!coords) {
    return null;
  }

  return getTopLevelBlockElement(view, coords.pos, options);
}

function blockFromPointer(
  view: EditorView,
  clientX: number,
  clientY: number,
  options: DragHandlePluginOptions,
): Element | null {
  const atPointer = blockFromPointerAt(view, clientX, clientY, options);
  if (atPointer) {
    return atPointer;
  }

  const contentColumnX = clientX + 50 + options.dragHandleWidth;
  return blockFromPointerAt(view, contentColumnX, clientY, options);
}

function resolveAtomNodePos(node: Element, view: EditorView): number | undefined {
  const rect = node.getBoundingClientRect();
  const coords = view.posAtCoords({
    left: rect.left + rect.width / 2,
    top: rect.top + Math.min(rect.height / 2, 24),
  });
  if (!coords) {
    return undefined;
  }

  const $pos = view.state.doc.resolve(coords.pos);
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    if (isAtomBlockType($pos.node(depth).type.name)) {
      return $pos.before(depth);
    }
  }

  return undefined;
}

function getHandleColumnLeft(view: EditorView, handleWidth: number): number {
  const proseMirrorStyle = window.getComputedStyle(view.dom);
  const paddingLeft = Number.parseFloat(proseMirrorStyle.paddingLeft) || 0;
  const borderLeft = Number.parseFloat(proseMirrorStyle.borderLeftWidth) || 0;
  const proseMirrorRect = view.dom.getBoundingClientRect();

  return proseMirrorRect.left + borderLeft + paddingLeft - handleWidth - HANDLE_OFFSET_PX;
}

function nodePosAtDOM(node: Element, view: EditorView): number | undefined {
  if (node.matches(ATOM_BLOCK_SELECTORS)) {
    return resolveAtomNodePos(node, view);
  }

  if (node.matches("ul, ol")) {
    const rect = node.getBoundingClientRect();
    const coords = view.posAtCoords({
      left: rect.left + 4,
      top: rect.top + 4,
    });
    if (!coords) {
      return undefined;
    }

    const $pos = view.state.doc.resolve(coords.pos);
    for (let depth = $pos.depth; depth > 0; depth -= 1) {
      if (isListBlockType($pos.node(depth).type.name)) {
        return $pos.before(depth);
      }
    }
  }

  const rect = node.getBoundingClientRect();
  return view.posAtCoords({
    left: rect.left + 4,
    top: rect.top + rect.height / 2,
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
  let activeBlock: Element | null = null;
  let dragHandleElement: HTMLDivElement | null = null;
  let editorView: EditorView | null = null;

  function hideDragHandle(): void {
    dragHandleElement?.classList.add("hide");
  }

  function showDragHandle(): void {
    dragHandleElement?.classList.remove("hide");
  }

  function positionDragHandle(node: Element, pointerY?: number): void {
    if (!dragHandleElement || !editorView) return;

    const verticalAnchor = getVerticalAnchor(node, pointerY);
    const verticalRect = verticalAnchor.getBoundingClientRect();

    const handleWidth = dragHandleElement.offsetWidth || options.dragHandleWidth;
    let top: number;

    if (verticalAnchor.matches(ATOM_BLOCK_SELECTORS)) {
      top = verticalRect.top + 8;
    } else {
      const compStyle = window.getComputedStyle(verticalAnchor);
      const parsedLineHeight = Number.parseInt(compStyle.lineHeight, 10);
      const lineHeight = Number.isNaN(parsedLineHeight)
        ? Number.parseInt(compStyle.fontSize, 10) * 1.2
        : parsedLineHeight;
      const paddingTop = Number.parseInt(compStyle.paddingTop, 10);
      top =
        verticalRect.top + (lineHeight - 24) / 2 + (Number.isNaN(paddingTop) ? 0 : paddingTop);
    }

    const left = getHandleColumnLeft(editorView, handleWidth);

    dragHandleElement.style.left = `${left}px`;
    dragHandleElement.style.top = `${top}px`;
    activeBlock = node;
    showDragHandle();
  }

  function updateHandleFromPointer(view: EditorView, clientX: number, clientY: number): void {
    const block = blockFromPointer(view, clientX, clientY, options);
    if (!block || block.closest(".not-draggable")) {
      hideDragHandle();
      return;
    }

    positionDragHandle(block, clientY);
  }

  function handleDragStart(event: DragEvent, view: EditorView): void {
    view.focus();
    if (!event.dataTransfer) return;

    const node = activeBlock ?? blockFromPointer(view, event.clientX, event.clientY, options);
    if (!(node instanceof Element)) return;

    let draggedNodePos = nodePosAtDOM(node, view);
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
      (view.state.selection.node.type.name === "listItem" ||
        isListBlockType(view.state.selection.node.type.name))
    ) {
      listType = node.matches("ol") ? "OL" : node.matches("ul") ? "UL" : "";
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
    const relatedTarget = event.relatedTarget;
    if (
      relatedTarget instanceof Element &&
      (relatedTarget.closest(".ProseMirror") ||
        relatedTarget.closest(".tiptap") ||
        relatedTarget.closest(".drag-handle") ||
        relatedTarget.closest(".moveable-control-box") ||
        relatedTarget.closest(".moveable-line"))
    ) {
      return;
    }
    hideDragHandle();
  }

  function handlePointerMove(clientX: number, clientY: number): void {
    if (!editorView?.editable) {
      return;
    }

    lastPointer = { x: clientX, y: clientY };
    updateHandleFromPointer(editorView, clientX, clientY);
  }

  return new Plugin({
    key: new PluginKey(options.pluginKey),
    view: (view) => {
      editorView = view;

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
      dragHandleElement.addEventListener("mouseenter", () => {
        if (activeBlock) {
          showDragHandle();
        }
      });
      hideDragHandle();

      if (!handleBySelector) {
        view.dom.parentElement?.appendChild(dragHandleElement);
      }

      view.dom.parentElement?.addEventListener("mouseout", hideHandleOnEditorOut);

      const scrollContainer = resolveEditorScrollContainer(view.dom);
      const onScroll = () => {
        if (!lastPointer || !editorView) return;
        updateHandleFromPointer(editorView, lastPointer.x, lastPointer.y);
      };
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });

      const onContainerMouseMove = (event: MouseEvent) => {
        handlePointerMove(event.clientX, event.clientY);
      };
      scrollContainer.addEventListener("mousemove", onContainerMouseMove);

      return {
        destroy: () => {
          if (!handleBySelector) {
            dragHandleElement?.remove();
          }
          dragHandleElement?.removeEventListener("dragstart", onDragHandleDragStart);
          dragHandleElement?.removeEventListener("drag", onDragHandleDrag);
          dragHandleElement?.removeEventListener("dragend", onDragHandleDragEnd);
          scrollContainer.removeEventListener("scroll", onScroll);
          scrollContainer.removeEventListener("mousemove", onContainerMouseMove);
          dragHandleElement = null;
          editorView = null;
          view.dom.parentElement?.removeEventListener("mouseout", hideHandleOnEditorOut);
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousemove: (view, event) => {
          if (!view.editable) return false;

          handlePointerMove(event.clientX, event.clientY);
          return false;
        },
        mouseleave: (_view, event) => {
          const relatedTarget = event.relatedTarget;
          if (
            relatedTarget instanceof Element &&
            (relatedTarget.closest(".drag-handle") ||
              relatedTarget.closest(".ProseMirror") ||
              relatedTarget.closest(".moveable-control-box") ||
              relatedTarget.closest(".moveable-line"))
          ) {
            return false;
          }
          hideDragHandle();
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
 * CMS drag handle for top-level blocks, including whole lists (not individual items).
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
