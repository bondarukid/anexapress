import { notFound, redirect } from "next/navigation";

import { PostEditorShell } from "@/components/cms/editor/post-editor-shell";
import { ContentPostsTable } from "@/components/cms/content-posts-table";
import { CreatePostForm } from "@/components/cms/create-post-form";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { canCreateContent } from "@/lib/team/permissions";
import { getWorkspaceAccessPermissions } from "@/services/team";
import { getPostEditorData, listPostVersions, listPosts } from "@/services/post.service";
import { listSites } from "@/services/site.service";
import { getCurrentUser } from "@/services/user";

type ContentPageParams = {
  workspaceSlug: string;
  slug?: string;
  siteId?: string;
};

type ContentSearchParams = {
  site?: string;
};

export async function ContentListPage({
  params,
  searchParams,
}: {
  params: Promise<ContentPageParams>;
  searchParams?: Promise<ContentSearchParams>;
}) {
  const resolved = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const sites = await listSites(workspace.id);
  const search = searchParams ? await searchParams : {};
  const defaultSite = sites.find((s) => s.isDefault) ?? sites[0];
  const selectedSiteId = resolved.siteId ?? search.site ?? defaultSite?.id;
  const posts = selectedSiteId
    ? await listPosts(workspace.id, selectedSiteId)
    : await listPosts(workspace.id);

  return (
    <ContentPostsTable
      posts={posts}
      sites={sites}
      selectedSiteId={selectedSiteId ?? null}
      lockSiteFilter={Boolean(resolved.siteId)}
    />
  );
}

export async function ContentNewPage({
  params,
  searchParams,
}: {
  params: Promise<ContentPageParams>;
  searchParams?: Promise<ContentSearchParams>;
}) {
  const resolved = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const access = await getWorkspaceAccessPermissions(workspace.id);
  if (!canCreateContent(access)) {
    notFound();
  }

  const sites = await listSites(workspace.id);
  const search = searchParams ? await searchParams : {};
  const defaultSite = sites.find((s) => s.isDefault) ?? sites[0];
  const siteId = resolved.siteId ?? search.site ?? defaultSite?.id;

  if (!siteId) {
    notFound();
  }

  const siteDashboardBase = resolved.siteId
    ? workspacePathFromSummary(workspace, `/sites/${resolved.siteId}`)
    : undefined;

  return (
    <CreatePostForm
      workspace={workspace}
      siteId={siteId}
      sites={sites}
      siteDashboardBase={siteDashboardBase}
    />
  );
}

export async function SitePostEditorPage({
  params,
}: {
  params: Promise<ContentPageParams & { postId: string }>;
}) {
  const resolved = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const { postId } = resolved;

  const [editorData, versions] = await Promise.all([
    getPostEditorData(workspace.id, postId, user.id),
    listPostVersions(workspace.id, postId),
  ]);

  if (!editorData) notFound();

  return <PostEditorShell data={editorData} versions={versions} />;
}
