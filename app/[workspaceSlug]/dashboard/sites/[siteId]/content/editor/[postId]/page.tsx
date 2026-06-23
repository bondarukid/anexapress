import { notFound, redirect } from "next/navigation";

import { mapDashboardEditorPathToEditorPath } from "@/lib/routing/editor-paths";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug?: string; siteId: string; postId: string }>;
};

export default async function LegacySitePostEditorRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const pathname = routeParams.slug
    ? `/${routeParams.workspaceSlug}/${routeParams.slug}/dashboard/sites/${routeParams.siteId}/content/editor/${routeParams.postId}`
    : `/${routeParams.workspaceSlug}/dashboard/sites/${routeParams.siteId}/content/editor/${routeParams.postId}`;

  const destination = mapDashboardEditorPathToEditorPath(pathname);
  if (!destination) notFound();
  redirect(destination);
}
