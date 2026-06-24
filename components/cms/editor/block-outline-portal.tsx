"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { BlockOutlinePanel } from "@/components/cms/editor/block-outline-panel";
import { EDITOR_BLOCK_OUTLINE_ROOT_ID } from "@/components/cms/editor/editor-block-sidebar";

/**
 * Portals the block outline into the left dashboard sidebar mount point.
 */
export function BlockOutlinePortal() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const resolveContainer = () => document.getElementById(EDITOR_BLOCK_OUTLINE_ROOT_ID);

    const initial = resolveContainer();
    if (initial) {
      setContainer(initial);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const next = resolveContainer();
      if (next) {
        setContainer(next);
        window.clearInterval(intervalId);
      }
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(<BlockOutlinePanel />, container);
}
