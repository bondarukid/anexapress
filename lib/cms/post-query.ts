import type { createClient } from "@/lib/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export const POST_SELECT_LEGACY =
  "id, workspace_id, site_id, blog_page_id, slug, title, status, published_at, seo_title, seo_description, seo_canonical, seo_keywords, og_image_id, current_draft_version_id, published_version_id, created_by, updated_by, created_at, updated_at";

const POST_SELECT_DISPLAY =
  "description, author_name, author_avatar_id, use_post_description_for_seo";

export const POST_SELECT = `${POST_SELECT_LEGACY}, ${POST_SELECT_DISPLAY}`;

export const PUBLISHED_POST_SELECT_FULL = `${POST_SELECT}, og_image:og_image_id ( public_url ), author_avatar:author_avatar_id ( public_url )`;

export const PUBLISHED_POST_SELECT_LEGACY = `${POST_SELECT_LEGACY}, og_image:og_image_id ( public_url )`;

export type PostRowDb = {
  id: string;
  workspace_id: string;
  site_id: string | null;
  blog_page_id: string | null;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  seo_keywords: string[] | null;
  og_image_id: string | null;
  description?: string | null;
  author_name?: string | null;
  author_avatar_id?: string | null;
  use_post_description_for_seo?: boolean;
  current_draft_version_id: string | null;
  published_version_id: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  og_image?: { public_url: string } | { public_url: string }[] | null;
  author_avatar?: { public_url: string } | { public_url: string }[] | null;
};

const DISPLAY_COLUMN_KEYS = [
  "description",
  "author_name",
  "author_avatar_id",
  "use_post_description_for_seo",
] as const;

/**
 * PostgREST / Postgres error when preview columns exist in code but not in DB yet.
 */
export function isMissingDisplayColumnError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

function withDisplayDefaults(row: PostRowDb): PostRowDb {
  return {
    ...row,
    description: row.description ?? null,
    author_name: row.author_name ?? null,
    author_avatar_id: row.author_avatar_id ?? null,
    use_post_description_for_seo: row.use_post_description_for_seo ?? false,
  };
}

type PostLookupFilters = {
  postId?: string;
  workspaceId?: string;
  siteId?: string;
  slug?: string;
  status?: string;
};

function buildPostQuery(supabase: SupabaseClient, select: string, filters: PostLookupFilters) {
  let query = supabase.from("posts").select(select);
  if (filters.postId) query = query.eq("id", filters.postId);
  if (filters.workspaceId) query = query.eq("workspace_id", filters.workspaceId);
  if (filters.siteId) query = query.eq("site_id", filters.siteId);
  if (filters.slug) query = query.eq("slug", filters.slug);
  if (filters.status) query = query.eq("status", filters.status);
  return query;
}

/**
 * Loads a post row, falling back when preview columns are not migrated yet.
 */
export async function fetchPostRow(
  supabase: SupabaseClient,
  select: string,
  filters: PostLookupFilters,
): Promise<{ data: PostRowDb | null; error: string | null }> {
  const { data, error } = await buildPostQuery(supabase, select, filters).maybeSingle();

  if (!error) {
    return { data: data ? withDisplayDefaults(data as unknown as PostRowDb) : null, error: null };
  }

  if (!isMissingDisplayColumnError(error)) {
    return { data: null, error: error.message };
  }

  const legacySelect = select.includes("og_image:")
    ? PUBLISHED_POST_SELECT_LEGACY
    : POST_SELECT_LEGACY;

  const legacy = await buildPostQuery(supabase, legacySelect, filters).maybeSingle();

  if (legacy.error) {
    return { data: null, error: legacy.error.message };
  }

  return {
    data: legacy.data ? withDisplayDefaults(legacy.data as unknown as PostRowDb) : null,
    error: null,
  };
}

/**
 * Updates post metadata, omitting preview columns when the migration is missing.
 */
export async function updatePostRow(
  supabase: SupabaseClient,
  postId: string,
  postUpdate: Record<string, unknown>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("posts").update(postUpdate).eq("id", postId);

  if (!error) {
    return { error: null };
  }

  if (!isMissingDisplayColumnError(error)) {
    return { error: error.message };
  }

  const legacyUpdate = { ...postUpdate };
  for (const key of DISPLAY_COLUMN_KEYS) {
    delete legacyUpdate[key];
  }

  const retry = await supabase.from("posts").update(legacyUpdate).eq("id", postId);
  return { error: retry.error?.message ?? null };
}
