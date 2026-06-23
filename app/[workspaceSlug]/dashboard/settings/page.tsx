import { redirect } from "next/navigation";

import { workspacePath } from "@/lib/routing/workspace-paths";

/**
 * `/{slug}/dashboard/settings` — default entry to personal Account settings.
 */
export default async function DashboardSettingsIndexPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  redirect(workspacePath(workspaceSlug, "/settings/account"));
}
