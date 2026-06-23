import { redirect, notFound } from "next/navigation";

import { WorkspaceOverview } from "@/components/dashboard/overview/workspace-overview";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { getWorkspaceAccessPermissions } from "@/services/team";
import { getCurrentUser } from "@/services/user";

type DashboardHomePageProps = {
  params: Promise<{ workspaceSlug: string; slug?: string }>;
};

/**
 * Dashboard home (`/dashboard`). Shell (sidebar/header) lives in `layout.tsx`.
 */
export default async function DashboardHomePage({ params }: DashboardHomePageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) {
    notFound();
  }

  const workspaceAccess = await getWorkspaceAccessPermissions(workspace.id);

  return <WorkspaceOverview workspace={workspace} workspaceAccess={workspaceAccess} />;
}
