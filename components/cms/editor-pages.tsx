import { notFound, redirect } from "next/navigation";

import { PostEditorShell } from "@/components/cms/editor/post-editor-shell";
import { formatUserDisplayName } from "@/lib/cms/post-author";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { getPostEditorData, listPostVersions } from "@/services/post.service";
import { getCurrentUser } from "@/services/user";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug?: string; postId: string }>;
};

export async function EditorPostPage({ params }: PageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) notFound();

  const { postId } = routeParams;

  const [editorData, versions] = await Promise.all([
    getPostEditorData(workspace.id, postId, user.id),
    listPostVersions(workspace.id, postId),
  ]);

  if (!editorData) notFound();

  return (
    <PostEditorShell
      data={editorData}
      versions={versions}
      userDisplayName={formatUserDisplayName(user)}
      userAvatarUrl={user.avatarUrl}
    />
  );
}
