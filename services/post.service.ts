import { createClient } from "@/lib/server";
import { syncPostBlocks } from "@/lib/cms/sync-post-blocks";
import { parseSeoSnapshot } from "@/lib/cms/parse-seo-snapshot";
import {
  mapPostRow,
  mapPostVersionRow,
  seoInputToDb,
  seoToSnapshot,
} from "@/lib/cms/post-mappers";
import {
  PERM_CONTENT_CREATE,
  PERM_CONTENT_PUBLISH,
} from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type { CreatePostInput, SaveDraftInput } from "@/schemas/post.schema";
import type {
  PostActionResult,
  PostEditorData,
  PostSummary,
  PostVersionSummary,
  PublishedPost,
  RevertedDraftData,
} from "@/types/post";
import type { TiptapContent } from "@/types/tiptap";

const POST_SELECT =
  "id, workspace_id, site_id, blog_page_id, slug, title, status, published_at, seo_title, seo_description, seo_canonical, seo_keywords, og_image_id, current_draft_version_id, published_version_id, created_by, updated_by, created_at, updated_at";

/**
 * Lists posts for a workspace dashboard table, optionally filtered by site.
 */
export async function listPosts(
  workspaceId: string,
  siteId?: string,
): Promise<PostSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at, site_id")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as PostSummary["status"],
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    siteId: row.site_id,
  }));
}

/**
 * Creates a post with an empty draft version via RPC.
 */
export async function createPost(
  userId: string,
  input: CreatePostInput,
): Promise<PostActionResult<{ postId: string }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();

  const slugQuery = supabase
    .from("posts")
    .select("id")
    .eq("slug", input.slug);

  const { data: existing } = input.siteId
    ? await slugQuery.eq("site_id", input.siteId).maybeSingle()
    : await slugQuery.eq("workspace_id", input.workspaceId).maybeSingle();

  if (existing) {
    return { success: false, error: "A post with this slug already exists.", code: "validation" };
  }

  const { data: postId, error } = await supabase.rpc("create_post_with_draft", {
    p_workspace_id: input.workspaceId,
    p_title: input.title,
    p_slug: input.slug,
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: blogPage } = await supabase
    .from("site_pages")
    .select("id")
    .eq("site_id", input.siteId)
    .eq("type", "blog_index")
    .maybeSingle();

  await supabase
    .from("posts")
    .update({
      site_id: input.siteId,
      blog_page_id: blogPage?.id ?? null,
    })
    .eq("id", postId as string);

  return { success: true, data: { postId: postId as string } };
}

/**
 * Loads editor payload: post metadata + current draft version.
 */
export async function getPostEditorData(
  workspaceId: string,
  postId: string,
  _userId: string,
): Promise<PostEditorData | null> {
  const supabase = await createClient();

  const [postRes, createPerm, publishPerm] = await Promise.all([
    supabase.from("posts").select(POST_SELECT).eq("id", postId).eq("workspace_id", workspaceId).maybeSingle(),
    supabase.rpc("has_effective_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_CONTENT_CREATE,
    }),
    supabase.rpc("has_effective_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_CONTENT_PUBLISH,
    }),
  ]);

  if (postRes.error || !postRes.data) {
    return null;
  }

  const post = mapPostRow(postRes.data);
  const draftVersionId = post.currentDraftVersionId;

  if (!draftVersionId) {
    return null;
  }

  const { data: versionRow, error: versionError } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", draftVersionId)
    .maybeSingle();

  if (versionError || !versionRow) {
    return null;
  }

  return {
    post,
    draftVersion: mapPostVersionRow(versionRow),
    canCreate: createPerm.data === true,
    canPublish: publishPerm.data === true,
  };
}

/**
 * Autosaves draft content and optional SEO/meta fields.
 */
export async function saveDraft(
  userId: string,
  input: SaveDraftInput,
): Promise<PostActionResult<{ savedAt: string }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();
  const seo = seoInputToDb(input.seo);

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, current_draft_version_id, title")
    .eq("id", input.postId)
    .eq("workspace_id", input.workspaceId)
    .maybeSingle();

  if (postError || !post?.current_draft_version_id) {
    return { success: false, error: "Post not found.", code: "not_found" };
  }

  const title = input.title ?? post.title;
  const seoSnapshot = seoToSnapshot(seo);

  const { error: versionError } = await supabase
    .from("post_versions")
    .update({
      content: input.content,
      title,
      seo_snapshot: seoSnapshot,
      is_current: true,
    })
    .eq("id", post.current_draft_version_id);

  if (versionError) {
    return { success: false, error: versionError.message };
  }

  const postUpdate: Record<string, unknown> = {
    updated_by: userId,
    seo_title: seo.seoTitle,
    seo_description: seo.seoDescription,
    seo_canonical: seo.seoCanonical,
    seo_keywords: seo.seoKeywords,
    og_image_id: seo.ogImageId,
  };

  if (input.title) {
    postUpdate.title = input.title;
  }

  const { error: metaError } = await supabase
    .from("posts")
    .update(postUpdate)
    .eq("id", input.postId);

  if (metaError) {
    return { success: false, error: metaError.message };
  }

  await syncPostBlocks(input.postId, post.current_draft_version_id, input.content as TiptapContent);

  return { success: true, data: { savedAt: new Date().toISOString() } };
}

/**
 * Creates a named snapshot from the current draft.
 */
export async function createSnapshot(
  userId: string,
  workspaceId: string,
  postId: string,
): Promise<PostActionResult<{ versionId: string }>> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, current_draft_version_id, title")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (postError || !post?.current_draft_version_id) {
    return { success: false, error: "Post not found.", code: "not_found" };
  }

  const { data: draft, error: draftError } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", post.current_draft_version_id)
    .single();

  if (draftError || !draft) {
    return { success: false, error: "Draft not found." };
  }

  const { data: maxVersion } = await supabase
    .from("post_versions")
    .select("version")
    .eq("post_id", postId)
    .eq("kind", "snapshot")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (maxVersion?.version ?? 0) + 1;

  const { data: snapshot, error: insertError } = await supabase
    .from("post_versions")
    .insert({
      post_id: postId,
      version: nextVersion,
      kind: "snapshot",
      is_current: false,
      content: draft.content,
      title: draft.title,
      seo_snapshot: draft.seo_snapshot,
      created_by: userId,
    })
    .select("id")
    .single();

  if (insertError || !snapshot) {
    return { success: false, error: insertError?.message ?? "Failed to create snapshot." };
  }

  await syncPostBlocks(postId, snapshot.id, draft.content as TiptapContent);

  return { success: true, data: { versionId: snapshot.id } };
}

/**
 * Publishes the current draft as a new published version.
 */
export async function publishPost(
  userId: string,
  workspaceId: string,
  postId: string,
): Promise<PostActionResult> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_PUBLISH);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (postError || !post?.current_draft_version_id) {
    return { success: false, error: "Post not found.", code: "not_found" };
  }

  const { data: draft, error: draftError } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", post.current_draft_version_id)
    .single();

  if (draftError || !draft) {
    return { success: false, error: "Draft not found." };
  }

  const { data: maxPublished } = await supabase
    .from("post_versions")
    .select("version")
    .eq("post_id", postId)
    .eq("kind", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (maxPublished?.version ?? 0) + 1;
  const now = new Date().toISOString();

  const { data: publishedVersion, error: publishError } = await supabase
    .from("post_versions")
    .insert({
      post_id: postId,
      version: nextVersion,
      kind: "published",
      is_current: false,
      content: draft.content,
      title: draft.title,
      seo_snapshot: draft.seo_snapshot,
      created_by: userId,
    })
    .select("id")
    .single();

  if (publishError || !publishedVersion) {
    return { success: false, error: publishError?.message ?? "Publish failed." };
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update({
      status: "published",
      published_at: now,
      published_version_id: publishedVersion.id,
      updated_by: userId,
    })
    .eq("id", postId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await syncPostBlocks(postId, publishedVersion.id, draft.content as TiptapContent);

  return { success: true };
}

/**
 * Restores draft content from a snapshot or published version.
 */
export async function revertToVersion(
  userId: string,
  workspaceId: string,
  postId: string,
  versionId: string,
): Promise<PostActionResult<RevertedDraftData>> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, current_draft_version_id")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (postError || !post?.current_draft_version_id) {
    return { success: false, error: "Post not found.", code: "not_found" };
  }

  const { data: source, error: sourceError } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", versionId)
    .eq("post_id", postId)
    .maybeSingle();

  if (sourceError || !source) {
    return { success: false, error: "Version not found.", code: "not_found" };
  }

  const { error: updateError } = await supabase
    .from("post_versions")
    .update({
      content: source.content,
      title: source.title,
      seo_snapshot: source.seo_snapshot,
    })
    .eq("id", post.current_draft_version_id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const snapshot = (source.seo_snapshot ?? {}) as Record<string, unknown>;

  await supabase
    .from("posts")
    .update({
      title: source.title,
      seo_title: (snapshot.seoTitle as string | null) ?? null,
      seo_description: (snapshot.seoDescription as string | null) ?? null,
      seo_canonical: (snapshot.seoCanonical as string | null) ?? null,
      seo_keywords: (snapshot.seoKeywords as string[]) ?? [],
      og_image_id: (snapshot.ogImageId as string | null) ?? null,
      updated_by: userId,
    })
    .eq("id", postId);

  await syncPostBlocks(postId, post.current_draft_version_id, source.content as TiptapContent);

  return {
    success: true,
    data: {
      content: source.content as TiptapContent,
      title: source.title,
      seo: parseSeoSnapshot(snapshot),
    },
  };
}

/**
 * Lists snapshot and published versions for the versions panel.
 */
export async function listPostVersions(
  workspaceId: string,
  postId: string,
): Promise<PostVersionSummary[]> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!post) return [];

  const { data, error } = await supabase
    .from("post_versions")
    .select("id, post_id, version, kind, created_at, title")
    .eq("post_id", postId)
    .in("kind", ["snapshot", "published"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    version: row.version,
    kind: row.kind as PostVersionSummary["kind"],
    createdAt: row.created_at,
    title: row.title,
  }));
}

/**
 * Fetches a published post by workspace slug and post slug for the public blog.
 */
export async function getPublishedPostBySlug(
  workspaceSlug: string,
  postSlug: string,
): Promise<PublishedPost | null> {
  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) return null;

  const { data: defaultSite } = await supabase
    .from("sites")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("is_default", true)
    .maybeSingle();

  if (defaultSite) {
    return getPublishedPostForSite(defaultSite.id, postSlug);
  }

  const { data: postRow, error } = await supabase
    .from("posts")
    .select(`${POST_SELECT}, media_files:og_image_id ( public_url )`)
    .eq("workspace_id", workspace.id)
    .eq("slug", postSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !postRow || !postRow.published_version_id) {
    return null;
  }

  const { data: versionRow } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", postRow.published_version_id)
    .maybeSingle();

  if (!versionRow) return null;

  const post = mapPostRow(postRow);
  const ogJoin = postRow.media_files as { public_url: string } | { public_url: string }[] | null;
  const ogImageUrl = Array.isArray(ogJoin) ? (ogJoin[0]?.public_url ?? null) : (ogJoin?.public_url ?? null);

  return {
    ...post,
    content: versionRow.content as TiptapContent,
    ogImageUrl,
  };
}

/**
 * Lists published posts for a site's public blog index.
 */
export async function listPublishedPostsForSite(siteId: string): Promise<PostSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at, site_id")
    .eq("site_id", siteId)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as PostSummary["status"],
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    siteId: row.site_id,
  }));
}

/**
 * Fetches a published post by site and post slug.
 */
export async function getPublishedPostForSite(
  siteId: string,
  postSlug: string,
): Promise<PublishedPost | null> {
  const supabase = await createClient();

  const { data: postRow, error } = await supabase
    .from("posts")
    .select(`${POST_SELECT}, media_files:og_image_id ( public_url )`)
    .eq("site_id", siteId)
    .eq("slug", postSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !postRow || !postRow.published_version_id) return null;

  const { data: versionRow } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", postRow.published_version_id)
    .maybeSingle();

  if (!versionRow) return null;

  const post = mapPostRow(postRow);
  const ogJoin = postRow.media_files as { public_url: string } | { public_url: string }[] | null;
  const ogImageUrl = Array.isArray(ogJoin) ? (ogJoin[0]?.public_url ?? null) : (ogJoin?.public_url ?? null);

  return {
    ...post,
    content: versionRow.content as TiptapContent,
    ogImageUrl,
  };
}

/**
 * Lists published posts for public blog index (legacy workspace-scoped).
 */
export async function listPublishedPosts(workspaceSlug: string): Promise<PostSummary[]> {
  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) return [];

  const { data: defaultSite } = await supabase
    .from("sites")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("is_default", true)
    .maybeSingle();

  if (defaultSite) {
    return listPublishedPostsForSite(defaultSite.id);
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at")
    .eq("workspace_id", workspace.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as PostSummary["status"],
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }));
}

export async function deletePost(
  userId: string,
  workspaceId: string,
  postId: string,
): Promise<PostActionResult> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
