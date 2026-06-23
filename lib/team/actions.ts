import { revalidatePath } from "next/cache";

import { PERM_MEMBERS_INVITE, PERM_MEMBERS_REMOVE } from "@/lib/team/permissions";

export function revalidateTeamPaths(workspaceSlug?: string) {
  revalidatePath("/", "layout");
  if (workspaceSlug) {
    revalidatePath(`/${workspaceSlug}/dashboard/team`);
  }
}

export { PERM_MEMBERS_INVITE, PERM_MEMBERS_REMOVE };
