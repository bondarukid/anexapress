import { notFound, redirect } from "next/navigation";

import { PostEditorShell } from "@/components/cms/editor/post-editor-shell";
import { ContentPostsTable } from "@/components/cms/content-posts-table";
import { formatUserDisplayName } from "@/lib/cms/post-author";
import { parsePageParam } from "@/lib/cms/parse-page-param";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { getPostEditorData, listPostVersions, listPostsPaginated } from "@/services/post.service";
import { listSites } from "@/services/site.service";
import { getCurrentUser } from "@/services/user";

type ContentPageParams = {
  workspaceSlug: string;
  slug?: string;
  siteId?: string;
};

type ContentSearchParams = {
  site?: string;
  page?: string;
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
  const page = parsePageParam(search.page);
  const lockSiteFilter = Boolean(resolved.siteId);

  const pagination = await listPostsPaginated(workspace.id, {
    siteId: selectedSiteId,
    page,
  });

  const contentBasePath = lockSiteFilter
    ? workspacePathFromSummary(workspace, `/sites/${resolved.siteId}/content`)
    : workspacePathFromSummary(workspace, "/content");

  return (
    <ContentPostsTable
      posts={pagination.items}
      pagination={pagination}
      sites={sites}
      selectedSiteId={selectedSiteId ?? null}
      lockSiteFilter={lockSiteFilter}
      contentBasePath={contentBasePath}
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

  return (
    <PostEditorShell
      data={editorData}
      versions={versions}
      userDisplayName={formatUserDisplayName(user)}
      userAvatarUrl={user.avatarUrl}
    />
  );
}
