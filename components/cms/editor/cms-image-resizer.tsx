"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { NodeSelection } from "@tiptap/pm/state";
import Moveable from "react-moveable";
import { useEditor } from "novel";

import { useEditorScrollContainer } from "@/components/cms/editor/editor-scroll-context";

function scheduleMoveableRectUpdate(moveableRef: RefObject<Moveable | null>): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      moveableRef.current?.updateRect();
    });
  });
}

/**
 * Image resize handles synced with the editor scroll container and current selection.
 */
export function CmsImageResizer() {
  const { editor } = useEditor();
  const scrollContainer = useEditorScrollContainer();
  const moveableRef = useRef<Moveable>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const syncTarget = useCallback(() => {
    if (!editor?.isActive("image")) {
      setTarget(null);
      return;
    }

    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection)) {
      setTarget(null);
      return;
    }

    const dom = editor.view.nodeDOM(selection.from);
    if (!(dom instanceof HTMLElement)) {
      setTarget(null);
      return;
    }

    if (dom instanceof HTMLImageElement) {
      dom.style.transform = "";
    }

    setTarget(dom);
    scheduleMoveableRectUpdate(moveableRef);
  }, [editor]);

  useEffect(() => {
    if (!editor) return undefined;

    const handleSelectionUpdate = () => {
      syncTarget();
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("transaction", handleSelectionUpdate);
    syncTarget();

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("transaction", handleSelectionUpdate);
    };
  }, [editor, syncTarget]);

  useEffect(() => {
    const container = scrollContainer;
    if (!container) return undefined;

    const onScroll = () => {
      setIsScrolling(true);
      scheduleMoveableRectUpdate(moveableRef);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scheduleMoveableRectUpdate(moveableRef);
      }, 100);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollContainer]);

  useEffect(() => {
    scheduleMoveableRectUpdate(moveableRef);
  }, [target, scrollContainer]);

  if (!editor?.isActive("image") || !target || !scrollContainer) {
    return null;
  }

  const moveable = (
    <Moveable
      ref={moveableRef}
      target={target}
      container={scrollContainer}
      rootContainer={scrollContainer}
      useAccuratePosition
      useResizeObserver
      useMutationObserver
      scalable={false}
      keepRatio
      throttleResize={0}
      className={isScrolling ? "cms-image-resizer--scrolling" : undefined}
      renderDirections={["nw", "ne", "sw", "se"]}
      onResize={({ target: element, width, height }) => {
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        scheduleMoveableRectUpdate(moveableRef);
      }}
      onResizeEnd={() => {
        if (!editor || !target) return;

        const width = Number.parseInt(target.style.width, 10);
        const height = Number.parseInt(target.style.height, 10);

        editor
          .chain()
          .focus()
          .updateAttributes("image", {
            width: Number.isNaN(width) ? null : width,
            height: Number.isNaN(height) ? null : height,
          })
          .run();

        scheduleMoveableRectUpdate(moveableRef);
      }}
    />
  );

  return createPortal(moveable, scrollContainer);
}
