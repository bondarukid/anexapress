import { Extension } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

function getTopLevelBlocks(dom: HTMLElement): HTMLElement[] {
  return Array.from(dom.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

function clearBlockTransforms(blocks: HTMLElement[]): void {
  blocks.forEach((block) => {
    block.style.transform = "";
    block.style.transition = "";
    block.style.opacity = "";
  });
}

function getDropIndex(blocks: HTMLElement[], clientY: number): number {
  for (let index = 0; index < blocks.length; index += 1) {
    const rect = blocks[index].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      return index;
    }
  }
  return blocks.length;
}

function applyShiftTransforms(
  blocks: HTMLElement[],
  fromIndex: number,
  toIndex: number,
): void {
  clearBlockTransforms(blocks);

  if (fromIndex < 0 || fromIndex >= blocks.length || fromIndex === toIndex) {
    return;
  }

  const draggedHeight = blocks[fromIndex].getBoundingClientRect().height;

  blocks.forEach((block) => {
    block.style.transition = "transform 150ms ease";
  });

  if (fromIndex < toIndex) {
    for (let index = fromIndex + 1; index <= toIndex && index < blocks.length; index += 1) {
      blocks[index].style.transform = `translateY(-${draggedHeight}px)`;
    }
    return;
  }

  for (let index = toIndex; index < fromIndex; index += 1) {
    blocks[index].style.transform = `translateY(${draggedHeight}px)`;
  }
}

function getDraggedBlockIndex(view: EditorView): number {
  const { selection, doc } = view.state;
  if (!(selection instanceof NodeSelection)) {
    return -1;
  }

  const resolved = doc.resolve(selection.from);
  return resolved.index(0);
}

/**
 * Shifts sibling blocks with CSS transforms while dragging to preview the drop position.
 */
export const BlockMoveAnimation = Extension.create({
  name: "blockMoveAnimation",

  addProseMirrorPlugins() {
    let draggedIndex = -1;

    const plugin = new Plugin({
      key: new PluginKey("blockMoveAnimation"),
      props: {
        handleDOMEvents: {
          dragstart: (view) => {
            draggedIndex = getDraggedBlockIndex(view);
            const blocks = getTopLevelBlocks(view.dom);
            blocks.forEach((block) => {
              block.style.transition = "transform 150ms ease, opacity 150ms ease";
            });

            if (draggedIndex >= 0 && blocks[draggedIndex]) {
              blocks[draggedIndex].style.opacity = "0.45";
            }

            return false;
          },
          dragover: (view, event) => {
            if (draggedIndex < 0) return false;

            event.preventDefault();
            const blocks = getTopLevelBlocks(view.dom);
            const targetIndex = getDropIndex(blocks, event.clientY);
            const clampedTarget = Math.max(0, Math.min(targetIndex, blocks.length - 1));
            applyShiftTransforms(blocks, draggedIndex, clampedTarget);

            if (blocks[draggedIndex]) {
              blocks[draggedIndex].style.opacity = "0.45";
            }

            return false;
          },
          drop: (view) => {
            clearBlockTransforms(getTopLevelBlocks(view.dom));
            draggedIndex = -1;
            return false;
          },
          dragend: (view) => {
            clearBlockTransforms(getTopLevelBlocks(view.dom));
            draggedIndex = -1;
            return false;
          },
        },
      },
    });

    return [plugin];
  },
});
