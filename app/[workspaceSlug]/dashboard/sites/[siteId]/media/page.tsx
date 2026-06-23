import { redirect } from "next/navigation";

import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { getCurrentUser } from "@/services/user";

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
};

/** Legacy site media route → unified file manager. */
export default async function SiteMediaRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) redirect("/login");

  redirect(
    workspacePathFromSummary(workspace, `/sites/${routeParams.siteId}/files`),
  );
}
