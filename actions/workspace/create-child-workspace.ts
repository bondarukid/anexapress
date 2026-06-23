"use server";

import { revalidatePath } from "next/cache";

import { CreateChildWorkspaceSchema } from "@/schemas/workspace.schema";
import { requireWorkspacePermission } from "@/services/team";
import { PERM_WORKSPACE_UPDATE } from "@/lib/team/permissions";
import { createChildWorkspace } from "@/services/workspace-family";
import { buildWorkspacePath } from "@/lib/workspace-family/paths";

export async function createChildWorkspaceAction(input: unknown) {
  const parsed = CreateChildWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const permission = await requireWorkspacePermission(
    parsed.data.parentWorkspaceId,
    PERM_WORKSPACE_UPDATE,
  );
  if (!permission.success) {
    return { success: false as const, error: permission.error };
  }

  const result = await createChildWorkspace({
    parentId: parsed.data.parentWorkspaceId,
    name: parsed.data.workspaceName,
    slug: parsed.data.workspaceUrl,
    timezone: parsed.data.timezone,
  });

  if (!result.success) {
    return result;
  }

  revalidatePath(
    buildWorkspacePath({
      parentSlug: result.workspace.parentSlug ?? "",
      childSlug: result.workspace.slug,
    }),
  );
  return result;
}
