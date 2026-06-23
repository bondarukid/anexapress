import { notFound, redirect } from "next/navigation";

import { mapDashboardEditorPathToEditorPath } from "@/lib/routing/editor-paths";

export const metadata = {
  title: "Page editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug?: string; siteId: string; pageId: string }>;
};

export default async function LegacySitePageEditorRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const pathname = routeParams.slug
    ? `/${routeParams.workspaceSlug}/${routeParams.slug}/dashboard/sites/${routeParams.siteId}/pages/editor/${routeParams.pageId}`
    : `/${routeParams.workspaceSlug}/dashboard/sites/${routeParams.siteId}/pages/editor/${routeParams.pageId}`;

  const destination = mapDashboardEditorPathToEditorPath(pathname);
  if (!destination) notFound();
  redirect(destination);
}
