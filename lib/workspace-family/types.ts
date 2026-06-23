import type { WorkspaceSummary } from "@/types/workspace";

/** A workspace node within a family tree (root or child). */
export type WorkspaceFamilyNode = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
  parentId: string | null;
  isChild: boolean;
};

/** Resolved scope for aggregation: self + optional parent + children. */
export type WorkspaceScope = {
  self: WorkspaceFamilyNode;
  parent: WorkspaceFamilyNode | null;
  children: WorkspaceFamilyNode[];
  /** All workspace ids in this family scope (self + children). */
  workspaceIds: string[];
};

/** Parsed URL path segments for tenant routing. */
export type ResolvedWorkspacePath = {
  parentSlug: string;
  childSlug: string | null;
  restPath: string;
};

/** Input for resolving a workspace from URL slugs. */
export type ResolveWorkspaceInput = {
  parentSlug: string;
  childSlug?: string | null;
  userId: string;
};

export type ResolvedWorkspace = WorkspaceSummary & {
  parentId: string | null;
  parentSlug: string | null;
  isChild: boolean;
  pathKey: string;
};
