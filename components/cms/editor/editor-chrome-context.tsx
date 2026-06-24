"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type EditorChromeData = {
  title: string;
  status: string;
  savedAt: string | null;
  isSaving: boolean;
  isPublishing: boolean;
  canPublish: boolean;
  closeHref: string;
  closeLabel: string;
};

type EditorChromeActions = {
  onSaveVersion: () => void;
  onPublish: () => void;
};

export type EditorChromeState = EditorChromeData & EditorChromeActions;

const DEFAULT_CHROME_DATA: EditorChromeData = {
  title: "Editor",
  status: "draft",
  savedAt: null,
  isSaving: false,
  isPublishing: false,
  canPublish: false,
  closeHref: "/",
  closeLabel: "Back",
};

const DEFAULT_CHROME: EditorChromeState = {
  ...DEFAULT_CHROME_DATA,
  onSaveVersion: () => undefined,
  onPublish: () => undefined,
};

type EditorChromeContextValue = {
  chrome: EditorChromeState;
  setChrome: (patch: Partial<EditorChromeState>) => void;
};

const EditorChromeContext = createContext<EditorChromeContextValue | null>(null);

function chromeDataEqual(left: EditorChromeData, right: EditorChromeData): boolean {
  return (
    left.title === right.title &&
    left.status === right.status &&
    left.savedAt === right.savedAt &&
    left.isSaving === right.isSaving &&
    left.isPublishing === right.isPublishing &&
    left.canPublish === right.canPublish &&
    left.closeHref === right.closeHref &&
    left.closeLabel === right.closeLabel
  );
}

/**
 * Chrome state for the CMS editor header and left sidebar.
 * Callbacks are stored in refs so updating handlers does not re-render consumers.
 */
export function EditorChromeProvider({ children }: { children: ReactNode }) {
  const [chromeData, setChromeData] = useState<EditorChromeData>(DEFAULT_CHROME_DATA);

  const actionsRef = useRef<EditorChromeActions>({
    onSaveVersion: () => undefined,
    onPublish: () => undefined,
  });

  const stableActions = useMemo<EditorChromeActions>(
    () => ({
      onSaveVersion: () => {
        actionsRef.current.onSaveVersion();
      },
      onPublish: () => {
        actionsRef.current.onPublish();
      },
    }),
    [],
  );

  const setChrome = useCallback((patch: Partial<EditorChromeState>) => {
    if (patch.onSaveVersion) {
      actionsRef.current.onSaveVersion = patch.onSaveVersion;
    }
    if (patch.onPublish) {
      actionsRef.current.onPublish = patch.onPublish;
    }

    const dataPatch: Partial<EditorChromeData> = {};
    if (patch.title !== undefined) dataPatch.title = patch.title;
    if (patch.status !== undefined) dataPatch.status = patch.status;
    if (patch.savedAt !== undefined) dataPatch.savedAt = patch.savedAt;
    if (patch.isSaving !== undefined) dataPatch.isSaving = patch.isSaving;
    if (patch.isPublishing !== undefined) dataPatch.isPublishing = patch.isPublishing;
    if (patch.canPublish !== undefined) dataPatch.canPublish = patch.canPublish;
    if (patch.closeHref !== undefined) dataPatch.closeHref = patch.closeHref;
    if (patch.closeLabel !== undefined) dataPatch.closeLabel = patch.closeLabel;

    if (Object.keys(dataPatch).length === 0) {
      return;
    }

    setChromeData((current) => {
      const next = { ...current, ...dataPatch };
      return chromeDataEqual(current, next) ? current : next;
    });
  }, []);

  const chrome = useMemo<EditorChromeState>(
    () => ({
      ...chromeData,
      ...stableActions,
    }),
    [chromeData, stableActions],
  );

  const value = useMemo(
    () => ({
      chrome,
      setChrome,
    }),
    [chrome, setChrome],
  );

  return <EditorChromeContext.Provider value={value}>{children}</EditorChromeContext.Provider>;
}

export function useEditorChrome(): EditorChromeContextValue {
  const context = useContext(EditorChromeContext);
  if (!context) {
    return {
      chrome: DEFAULT_CHROME,
      setChrome: () => undefined,
    };
  }
  return context;
}
