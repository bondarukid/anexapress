import { notFound, redirect } from "next/navigation";

import { mapDashboardEditorPathToEditorPath } from "@/lib/routing/editor-paths";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; postId: string }>;
};

/** Legacy dashboard editor URL → standalone editor route. */
export default async function LegacyEditorRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const pathname = `/${routeParams.workspaceSlug}/dashboard/content/editor/${routeParams.postId}`;

  const destination = mapDashboardEditorPathToEditorPath(pathname);
  if (!destination) notFound();
  redirect(destination);
}
