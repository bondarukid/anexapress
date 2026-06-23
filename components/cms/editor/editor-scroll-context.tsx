"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { setEditorScrollContainer } from "@/lib/cms/editor-scroll-container";

const EditorScrollContext = createContext<HTMLElement | null>(null);

type EditorScrollProviderProps = {
  children: ReactNode;
  container: HTMLElement | null;
};

/**
 * Registers the editor scroll container for React components and ProseMirror plugins.
 */
export function EditorScrollProvider({ children, container }: EditorScrollProviderProps) {
  useEffect(() => {
    setEditorScrollContainer(container);
    return () => {
      setEditorScrollContainer(null);
    };
  }, [container]);

  return (
    <EditorScrollContext.Provider value={container}>{children}</EditorScrollContext.Provider>
  );
}

export function useEditorScrollContainer(): HTMLElement | null {
  return useContext(EditorScrollContext);
}

/**
 * Callback ref helper for the editor scroll `<main>` element.
 */
export function useEditorScrollRef(): {
  scrollContainer: HTMLElement | null;
  scrollRef: (element: HTMLElement | null) => void;
} {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  const scrollRef = useCallback((element: HTMLElement | null) => {
    setScrollContainer(element);
  }, []);

  return { scrollContainer, scrollRef };
}
