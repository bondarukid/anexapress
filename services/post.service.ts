import { clampPage } from "@/lib/cms/parse-page-param";
import { POSTS_TABLE_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/server";
import { syncPostBlocks } from "@/lib/cms/sync-post-blocks";
import { parseSeoSnapshot } from "@/lib/cms/parse-seo-snapshot";
import {
  mapPostRow,
  mapPostVersionRow,
  buildDraftSnapshot,
  applyVersionSnapshotToPost,
  applyPublishedVersionToPost,
  parseDraftSlugFromSnapshot,
  parseDisplaySnapshot,
  postDraftDiffersFromPublished,
  seoInputToDb,
} from "@/lib/cms/post-mappers";
import {
  PERM_CONTENT_CREATE,
  PERM_CONTENT_PUBLISH,
} from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import { getMediaById } from "@/services/media.service";
import { getSitePublicSlugs, resolveProxiedAuthorAvatarUrl } from "@/services/author-avatar.service";
import { getProfileAvatarUrlByUserId } from "@/services/user";
import { resolvePostAuthorAvatarUrl, isPostAuthorProfile } from "@/lib/cms/post-author";
import { resolvePostCoverImageUrl } from "@/lib/cms/post-cover-image";
import type { CreatePostInput, SaveDraftInput } from "@/schemas/post.schema";
import type {
  BlogPostListItem,
  PaginatedResult,
  PostActionResult,
  PostDashboardListItem,
  PostEditorData,
  PostStatus,
  PostSummary,
  PostVersionSummary,
  PublishedPost,
  RevertedDraftData,
} from "@/types/post";
import type { TiptapContent } from "@/types/tiptap";

import {
  fetchPostRow,
  POST_SELECT,
  updatePostRow,
} from "@/lib/cms/post-query";

type PostVersionCompareSource = {
  title: string;
  content: unknown;
  seo_snapshot: Record<string, unknown> | null;
};

async function resolveHasUnpublishedChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  publishedVersionId: string | null,
  draftVersion: PostVersionCompareSource,
): Promise<boolean> {
  if (!publishedVersionId) return false;

  const { data: publishedVersion } = await supabase
    .from("post_versions")
    .select("title, content, seo_snapshot")
    .eq("id", publishedVersionId)
    .maybeSingle();

  if (!publishedVersion) return false;

  return postDraftDiffersFromPublished(draftVersion, {
    title: publishedVersion.title,
    content: publishedVersion.content,
    seo_snapshot: (publishedVersion.seo_snapshot ?? {}) as Record<string, unknown>,
  });
}

/**
 * Builds public post payload from live post row + published version snapshot.
 */
async function resolvePublishedPost(
  postRow: import("@/lib/cms/post-query").PostRowDb,
  versionRow: {
    title: string;
    content: unknown;
    seo_snapshot: Record<string, unknown> | null;
  },
): Promise<PublishedPost> {
  const base = mapPostRow(postRow);
  const snapshot = (versionRow.seo_snapshot ?? {}) as Record<string, unknown>;
  const merged = applyPublishedVersionToPost(base, versionRow.title, snapshot);

  const [ogMedia, authorMedia, siteSlugs] = await Promise.all([
    merged.ogImageId ? getMediaById(merged.ogImageId) : Promise.resolve(null),
    merged.authorAvatarId ? getMediaById(merged.authorAvatarId) : Promise.resolve(null),
    postRow.site_id ? getSitePublicSlugs(postRow.site_id) : Promise.resolve(null),
  ]);

  const customAvatarUrl = authorMedia?.publicUrl ?? null;

  let profileAvatarUrl: string | null = null;
  if (isPostAuthorProfile(merged.authorName) && siteSlugs) {
    profileAvatarUrl = await resolveProxiedAuthorAvatarUrl({
      siteSlugs,
      userId: postRow.created_by,
    });
  }

  return {
    ...merged,
    content: versionRow.content as TiptapContent,
    ogImageUrl: ogMedia?.publicUrl ?? null,
    authorAvatarUrl: resolvePostAuthorAvatarUrl({
      authorName: merged.authorName,
      customAvatarUrl,
      profileAvatarUrl,
    }),
  };
}

async function findPostSlugConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  workspaceId: string,
  siteId: string | null,
  excludePostId: string,
): Promise<boolean> {
  let query = supabase.from("posts").select("id").eq("slug", slug).neq("id", excludePostId);

  if (siteId) {
    query = query.eq("site_id", siteId);
  } else {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data } = await query.maybeSingle();
  return data != null;
}

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

type ListPostsPaginatedOptions = {
  siteId?: string;
  page?: number;
  pageSize?: number;
};

type PostVersionContentRow = {
  content: unknown;
};

type PostPaginatedRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  site_id: string | null;
  published_version: PostVersionContentRow | PostVersionContentRow[] | null;
  current_draft: PostVersionContentRow | PostVersionContentRow[] | null;
};

function resolveDashboardPostCoverImageUrl(row: PostPaginatedRow): string | null {
  const publishedVersion = Array.isArray(row.published_version)
    ? row.published_version[0]
    : row.published_version;
  const draftVersion = Array.isArray(row.current_draft)
    ? row.current_draft[0]
    : row.current_draft;

  const contentForCover =
    row.status === "published" && publishedVersion?.content
      ? publishedVersion.content
      : (draftVersion?.content ?? publishedVersion?.content);

  return resolvePostCoverImageUrl({ content: contentForCover });
}

/**
 * Lists posts for the dashboard table with server-side pagination.
 */
export async function listPostsPaginated(
  workspaceId: string,
  options: ListPostsPaginatedOptions = {},
): Promise<PaginatedResult<PostDashboardListItem>> {
  const pageSize = options.pageSize ?? POSTS_TABLE_PAGE_SIZE;
  const requestedPage = options.page ?? 1;
  const supabase = await createClient();

  let countQuery = supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (options.siteId) {
    countQuery = countQuery.eq("site_id", options.siteId);
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    throw new Error(countError.message);
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const page = clampPage(requestedPage, totalPages === 0 ? 1 : totalPages);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let dataQuery = supabase
    .from("posts")
    .select(
      `
      id,
      slug,
      title,
      status,
      published_at,
      updated_at,
      created_at,
      site_id,
      published_version:post_versions!posts_published_version_id_fkey (content),
      current_draft:post_versions!posts_current_draft_version_id_fkey (content)
    `,
    )
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (options.siteId) {
    dataQuery = dataQuery.eq("site_id", options.siteId);
  }

  const { data, error } = await dataQuery.range(from, to);
  if (error) {
    throw new Error(error.message);
  }

  return {
    items: ((data ?? []) as PostPaginatedRow[]).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status as PostDashboardListItem["status"],
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
      siteId: row.site_id,
      coverImageUrl: resolveDashboardPostCoverImageUrl(row),
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
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
  userId: string,
): Promise<PostEditorData | null> {
  const supabase = await createClient();

  const [postLookup, createPerm, publishPerm] = await Promise.all([
    fetchPostRow(supabase, POST_SELECT, { postId, workspaceId }),
    supabase.rpc("has_effective_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_CONTENT_CREATE,
    }),
    supabase.rpc("has_effective_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_CONTENT_PUBLISH,
    }),
  ]);

  if (postLookup.error) {
    console.error("[getPostEditorData] post query failed:", postLookup.error);
    return null;
  }

  if (!postLookup.data) {
    return null;
  }

  const post = mapPostRow(postLookup.data);
  const draftVersionId = post.currentDraftVersionId;

  if (!draftVersionId) {
    console.error("[getPostEditorData] post has no current_draft_version_id:", postId);
    return null;
  }

  const { data: versionRow, error: versionError } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", draftVersionId)
    .maybeSingle();

  if (versionError || !versionRow) {
    if (versionError) {
      console.error("[getPostEditorData] draft version query failed:", versionError.message);
    }
    return null;
  }

  const snapshot = (versionRow.seo_snapshot ?? {}) as Record<string, unknown>;
  const mergedPost = applyVersionSnapshotToPost(post, versionRow.title, snapshot);
  const draftSlug = parseDraftSlugFromSnapshot(snapshot) ?? post.slug;

  const [customAuthorMedia, profileAvatarUrl] = await Promise.all([
    mergedPost.authorAvatarId ? getMediaById(mergedPost.authorAvatarId) : Promise.resolve(null),
    getProfileAvatarUrlByUserId(userId),
  ]);

  const authorAvatarUrl = resolvePostAuthorAvatarUrl({
    authorName: mergedPost.authorName,
    customAvatarUrl: customAuthorMedia?.publicUrl ?? null,
    profileAvatarUrl,
  });

  const hasUnpublishedChanges = await resolveHasUnpublishedChanges(
    supabase,
    post.publishedVersionId,
    {
      title: versionRow.title,
      content: versionRow.content,
      seo_snapshot: snapshot,
    },
  );

  return {
    post: { ...mergedPost, slug: draftSlug },
    draftVersion: mapPostVersionRow(versionRow),
    canCreate: createPerm.data === true,
    canPublish: publishPerm.data === true,
    authorAvatarUrl,
    hasUnpublishedChanges,
  };
}

/**
 * Autosaves draft content and optional SEO/meta fields.
 * Updates the current draft version in place — never creates a published version.
 * Use {@link publishPost} to push draft changes live.
 */
export async function saveDraft(
  userId: string,
  input: SaveDraftInput,
): Promise<
  PostActionResult<{
    savedAt: string;
    status: PostStatus;
    slug: string;
    hasUnpublishedChanges: boolean;
  }>
> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();
  const seo = seoInputToDb(input.seo);
  const display = input.display;
  const draftSnapshot = buildDraftSnapshot(
    {
      ...seo,
      seoDescription: input.seo?.seoDescription ?? seo.seoDescription,
      usePostDescriptionForSeo: input.seo?.usePostDescriptionForSeo ?? false,
    },
    display,
    { slug: input.slug ?? null },
  );

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, current_draft_version_id, published_version_id, title, status, slug, site_id")
    .eq("id", input.postId)
    .eq("workspace_id", input.workspaceId)
    .maybeSingle();

  if (postError || !post?.current_draft_version_id) {
    return { success: false, error: "Post not found.", code: "not_found" };
  }

  const hasPublishedVersion = Boolean(post.published_version_id);
  const title = input.title ?? post.title;

  const { error: versionError } = await supabase
    .from("post_versions")
    .update({
      content: input.content,
      title,
      seo_snapshot: draftSnapshot,
      is_current: true,
    })
    .eq("id", post.current_draft_version_id);

  if (versionError) {
    return { success: false, error: versionError.message };
  }

  const postUpdate: Record<string, unknown> = {
    updated_by: userId,
  };

  if (!hasPublishedVersion) {
    if (display) {
      postUpdate.description = display.description ?? null;
      postUpdate.author_name = display.authorName ?? null;
      postUpdate.author_avatar_id = display.authorAvatarId ?? null;
    }
  }

  let nextSlug = parseDraftSlugFromSnapshot(draftSnapshot) ?? post.slug;

  if (!hasPublishedVersion && input.slug && input.slug !== post.slug) {
    const slugTaken = await findPostSlugConflict(
      supabase,
      input.slug,
      input.workspaceId,
      post.site_id,
      input.postId,
    );

    if (slugTaken) {
      return {
        success: false,
        error: "A post with this slug already exists.",
        code: "validation",
      };
    }

    postUpdate.slug = input.slug;
    nextSlug = input.slug;
  }

  if (!hasPublishedVersion && Object.keys(postUpdate).length > 1) {
    const { error: metaError } = await updatePostRow(supabase, input.postId, postUpdate);
    if (metaError) {
      return { success: false, error: metaError };
    }
  } else {
    await supabase.from("posts").update({ updated_by: userId }).eq("id", input.postId);
  }

  await syncPostBlocks(input.postId, post.current_draft_version_id, input.content as TiptapContent);

  let nextStatus = post.status as PostStatus;

  if (input.status && input.status !== post.status) {
    if (input.status === "published") {
      // Publishing is only allowed via publishPost() (editor Publish button).
    } else if (input.status === "draft" && hasPublishedVersion) {
      // Keep post in published lists; draft edits live in current_draft_version only.
    } else {
      const { error: statusError } = await supabase
        .from("posts")
        .update({ status: input.status, updated_by: userId })
        .eq("id", input.postId);

      if (statusError) {
        return { success: false, error: statusError.message };
      }

      nextStatus = input.status;
    }
  }

  const hasUnpublishedChanges = await resolveHasUnpublishedChanges(
    supabase,
    post.published_version_id,
    {
      title,
      content: input.content,
      seo_snapshot: draftSnapshot,
    },
  );

  return {
    success: true,
    data: {
      savedAt: new Date().toISOString(),
      status: nextStatus,
      slug: nextSlug,
      hasUnpublishedChanges,
    },
  };
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

  const postLookup = await fetchPostRow(supabase, POST_SELECT, {
    postId,
    workspaceId,
  });

  if (postLookup.error || !postLookup.data?.current_draft_version_id) {
    return { success: false, error: "Post not found.", code: "not_found" };
  }

  const post = postLookup.data;

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

  const snapshot = (draft.seo_snapshot ?? {}) as Record<string, unknown>;
  const display = parseDisplaySnapshot(snapshot);
  const seo = parseSeoSnapshot(snapshot);
  const nextSlug = parseDraftSlugFromSnapshot(snapshot);

  const liveUpdate: Record<string, unknown> = {
    status: "published",
    published_at: now,
    published_version_id: publishedVersion.id,
    updated_by: userId,
    title: draft.title,
    description: display.description ?? null,
    author_name: display.authorName ?? null,
    author_avatar_id: display.authorAvatarId ?? null,
    seo_title: seo.seoTitle ?? null,
    seo_description: seo.seoDescription ?? null,
    seo_canonical: seo.seoCanonical ?? null,
    seo_keywords: seo.seoKeywords ?? [],
    og_image_id: seo.ogImageId ?? null,
    use_post_description_for_seo: seo.usePostDescriptionForSeo ?? false,
  };

  if (nextSlug) {
    const slugTaken = await findPostSlugConflict(
      supabase,
      nextSlug,
      workspaceId,
      post.site_id ?? null,
      postId,
    );
    if (!slugTaken) {
      liveUpdate.slug = nextSlug;
    }
  }

  const { error: updateError } = await updatePostRow(supabase, postId, liveUpdate);

  if (updateError) {
    return { success: false, error: updateError };
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
  const display = parseDisplaySnapshot(snapshot);

  await supabase.from("posts").update({ updated_by: userId }).eq("id", postId);

  await syncPostBlocks(postId, post.current_draft_version_id, source.content as TiptapContent);

  const authorAvatarUrl = display.authorAvatarId
    ? ((await getMediaById(display.authorAvatarId))?.publicUrl ?? null)
    : null;

  const profileAvatarUrl = await getProfileAvatarUrlByUserId(userId);

  return {
    success: true,
    data: {
      content: source.content as TiptapContent,
      title: source.title,
      seo: parseSeoSnapshot(snapshot),
      display,
      authorAvatarUrl: resolvePostAuthorAvatarUrl({
        authorName: display.authorName,
        customAvatarUrl: authorAvatarUrl,
        profileAvatarUrl,
      }),
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

  const postLookup = await fetchPostRow(supabase, POST_SELECT, {
    workspaceId: workspace.id,
    slug: postSlug,
    status: "published",
  });

  if (postLookup.error || !postLookup.data?.published_version_id) {
    return null;
  }

  const postRow = postLookup.data;

  const { data: versionRow } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", postRow.published_version_id)
    .maybeSingle();

  if (!versionRow) return null;

  return resolvePublishedPost(postRow, versionRow);
}

/**
 * Lists published posts for a site's public blog index.
 */
export async function listPublishedPostsForSite(siteId: string): Promise<BlogPostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      slug,
      title,
      status,
      published_at,
      updated_at,
      created_at,
      site_id,
      created_by,
      published_version:post_versions!posts_published_version_id_fkey (
        content,
        seo_snapshot
      )
    `,
    )
    .eq("site_id", siteId)
    .eq("status", "published")
    .not("published_version_id", "is", null)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);

  const siteSlugs = await getSitePublicSlugs(siteId);
  const proxiedAvatarUrlByUserId = new Map<string, string | null>();

  return Promise.all(
    (data ?? []).map(async (row) => {
      const versionRow = Array.isArray(row.published_version)
        ? row.published_version[0]
        : row.published_version;
      const snapshot = (versionRow?.seo_snapshot ?? {}) as Record<string, unknown>;
      const display = parseDisplaySnapshot(snapshot);
      const content = versionRow?.content;
      const authorName = display.authorName?.trim() || null;

      const authorMedia =
        display.authorAvatarId ? await getMediaById(display.authorAvatarId) : null;

      let profileAvatarUrl: string | null = null;
      if (isPostAuthorProfile(authorName) && siteSlugs) {
        const cached = proxiedAvatarUrlByUserId.get(row.created_by);
        if (cached !== undefined) {
          profileAvatarUrl = cached;
        } else {
          profileAvatarUrl = await resolveProxiedAuthorAvatarUrl({
            siteSlugs,
            userId: row.created_by,
          });
          proxiedAvatarUrlByUserId.set(row.created_by, profileAvatarUrl);
        }
      }

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        status: row.status as BlogPostListItem["status"],
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
        siteId: row.site_id,
        summary: display.description?.trim() || null,
        authorName,
        authorAvatarUrl: resolvePostAuthorAvatarUrl({
          authorName,
          customAvatarUrl: authorMedia?.publicUrl ?? null,
          profileAvatarUrl,
        }),
        coverImageUrl: resolvePostCoverImageUrl({ content }),
      };
    }),
  );
}

/**
 * Fetches a published post by site and post slug.
 */
export async function getPublishedPostForSite(
  siteId: string,
  postSlug: string,
): Promise<PublishedPost | null> {
  const supabase = await createClient();

  const postLookup = await fetchPostRow(supabase, POST_SELECT, {
    siteId,
    slug: postSlug,
    status: "published",
  });

  if (postLookup.error || !postLookup.data?.published_version_id) return null;

  const postRow = postLookup.data;

  const { data: versionRow } = await supabase
    .from("post_versions")
    .select("*")
    .eq("id", postRow.published_version_id)
    .maybeSingle();

  if (!versionRow) return null;

  return resolvePublishedPost(postRow, versionRow);
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
