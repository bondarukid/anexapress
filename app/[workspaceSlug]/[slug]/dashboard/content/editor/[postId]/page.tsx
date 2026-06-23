import { notFound, redirect } from "next/navigation";

import { mapDashboardEditorPathToEditorPath } from "@/lib/routing/editor-paths";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; postId: string }>;
};

export default async function LegacyChildEditorRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const pathname = `/${routeParams.workspaceSlug}/${routeParams.slug}/dashboard/content/editor/${routeParams.postId}`;

  const destination = mapDashboardEditorPathToEditorPath(pathname);
  if (!destination) notFound();
  redirect(destination);
}
