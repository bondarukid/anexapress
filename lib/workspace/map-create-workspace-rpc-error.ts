import type { CreateWorkspaceResult } from "@/types/workspace";

export function mapCreateWorkspaceRpcError(
  message: string,
  options?: { includeAlreadyHasWorkspace?: boolean },
): CreateWorkspaceResult {
  if (message.includes("slug_taken")) {
    return {
      success: false,
      error: "This workspace URL is already taken. Please choose another.",
      code: "slug_taken",
    };
  }
  if (options?.includeAlreadyHasWorkspace && message.includes("already_has_workspace")) {
    return {
      success: false,
      error: "You already belong to a workspace.",
      code: "already_has_workspace",
    };
  }
  return { success: false, error: message };
}
