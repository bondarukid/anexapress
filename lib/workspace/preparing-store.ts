"use client";

const STORAGE_KEY = "workspace_preparing";

export type WorkspacePreparingState = {
  workspaceName: string;
  targetSlug: string | null;
};

type Listener = () => void;

let memoryState: WorkspacePreparingState | null = null;
const listeners = new Set<Listener>();

function readStorage(): WorkspacePreparingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkspacePreparingState;
  } catch {
    return null;
  }
}

function writeStorage(state: WorkspacePreparingState | null) {
  if (typeof window === "undefined") return;
  if (state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

function syncMemoryFromStorage() {
  memoryState = readStorage();
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getWorkspacePreparingState(): WorkspacePreparingState | null {
  if (memoryState) return memoryState;
  syncMemoryFromStorage();
  return memoryState;
}

export function startWorkspacePreparing(
  workspaceName: string,
  targetSlug: string | null = null,
): void {
  memoryState = { workspaceName, targetSlug };
  writeStorage(memoryState);
  emit();
}

export function updateWorkspacePreparing(patch: Partial<WorkspacePreparingState>): void {
  const current = getWorkspacePreparingState();
  if (!current) return;
  memoryState = { ...current, ...patch };
  writeStorage(memoryState);
  emit();
}

export function clearWorkspacePreparing(): void {
  memoryState = null;
  writeStorage(null);
  emit();
}

export function subscribeWorkspacePreparing(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
