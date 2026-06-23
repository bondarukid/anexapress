import { notFound, redirect } from "next/navigation";

import { PostEditorShell } from "@/components/cms/editor/post-editor-shell";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { getPostEditorData, listPostVersions } from "@/services/post.service";
import { getCurrentUser } from "@/services/user";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string; postId: string }>;
};

export default async function ChildPostEditorPage({ params }: PageProps) {
  const { workspaceSlug, childSlug, postId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute({ workspaceSlug, childSlug }, user.id);
  if (!workspace) notFound();

  const [editorData, versions] = await Promise.all([
    getPostEditorData(workspace.id, postId, user.id),
    listPostVersions(workspace.id, postId),
  ]);

  if (!editorData) notFound();

  return <PostEditorShell data={editorData} versions={versions} />;
}
