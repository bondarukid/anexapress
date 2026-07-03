import { redirect } from "next/navigation";

import { redirectToDefaultSiteSection } from "@/lib/dashboard/redirect-to-site-section";
import { siteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { getCurrentUser } from "@/services/user";

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
};

/** Legacy route — new posts open from a dialog on the content list. */
export default async function SiteContentNewRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) redirect("/login");

  const pathInput =
    workspace.isChild && workspace.parentSlug
      ? { parentSlug: workspace.parentSlug, childSlug: workspace.slug }
      : workspace.slug;

  redirect(siteDashboardPath(pathInput, routeParams.siteId, "/content"));
}
