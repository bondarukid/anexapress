import { createClient } from "@/lib/server";
import { PERM_CONTENT_CREATE } from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type { MediaActionResult, MediaFile } from "@/types/media";

const WORKSPACE_MEDIA_BUCKET = "workspace-media";
const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

type MediaRow = {
  id: string;
  workspace_id: string;
  site_id: string | null;
  storage_path: string;
  bucket: string;
  filename: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  public_url: string;
  created_by: string;
  created_at: string;
};

function mapMediaRow(row: MediaRow): MediaFile {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    siteId: row.site_id,
    storagePath: row.storage_path,
    bucket: row.bucket,
    filename: row.filename,
    mimeType: row.mime_type,
    size: row.size,
    width: row.width,
    height: row.height,
    alt: row.alt,
    title: row.title,
    publicUrl: row.public_url,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function buildStoragePath(workspaceId: string, filename: string, siteId?: string | null): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  const id = crypto.randomUUID();
  const scope = siteId ?? "_shared";
  return `${workspaceId}/${scope}/${year}/${month}/${id}.${ext}`;
}

type ListMediaOptions = {
  search?: string;
  limit?: number;
  offset?: number;
  siteId?: string | null;
};

/**
 * Lists media files for a workspace with optional search and site filter.
 * `siteId: null` returns workspace-shared media only.
 */
export async function listMediaFiles(
  workspaceId: string,
  options?: ListMediaOptions,
): Promise<MediaFile[]> {
  const supabase = await createClient();
  const limit = options?.limit ?? 24;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("media_files")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.siteId === null) {
    query = query.is("site_id", null);
  } else if (options?.siteId) {
    query = query.eq("site_id", options.siteId);
  }

  if (options?.search) {
    query = query.or(`filename.ilike.%${options.search}%,alt.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapMediaRow(row as MediaRow));
}

export async function getMediaById(mediaId: string): Promise<MediaFile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("media_files").select("*").eq("id", mediaId).maybeSingle();
  return data ? mapMediaRow(data as MediaRow) : null;
}

/**
 * Uploads a file to workspace-media and indexes it in media_files.
 */
export async function uploadMedia(
  userId: string,
  workspaceId: string,
  file: File,
  meta?: { alt?: string; title?: string; siteId?: string | null },
): Promise<MediaActionResult<{ media: MediaFile }>> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return { success: false, error: "Unsupported file type." };
  }

  if (file.size > MAX_MEDIA_SIZE) {
    return { success: false, error: "File exceeds 10 MB limit." };
  }

  const supabase = await createClient();
  const storagePath = buildStoragePath(workspaceId, file.name, meta?.siteId);

  const { error: uploadError } = await supabase.storage
    .from(WORKSPACE_MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(WORKSPACE_MEDIA_BUCKET).getPublicUrl(storagePath);

  const { data, error: dbError } = await supabase
    .from("media_files")
    .insert({
      workspace_id: workspaceId,
      site_id: meta?.siteId ?? null,
      storage_path: storagePath,
      bucket: WORKSPACE_MEDIA_BUCKET,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      alt: meta?.alt ?? null,
      title: meta?.title ?? null,
      public_url: publicUrl,
      created_by: userId,
    })
    .select("*")
    .single();

  if (dbError || !data) {
    await supabase.storage.from(WORKSPACE_MEDIA_BUCKET).remove([storagePath]);
    return { success: false, error: dbError?.message ?? "Failed to save media record." };
  }

  return { success: true, data: { media: mapMediaRow(data as MediaRow) } };
}

async function countMediaReferences(mediaId: string): Promise<string | null> {
  const supabase = await createClient();

  const checks = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("og_image_id", mediaId),
    supabase.from("site_pages").select("id", { count: "exact", head: true }).eq("og_image_id", mediaId),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("seo_default_og_image_id", mediaId),
    supabase
      .from("post_blocks")
      .select("id", { count: "exact", head: true })
      .filter("attrs->>mediaId", "eq", mediaId),
    supabase
      .from("site_page_blocks")
      .select("id", { count: "exact", head: true })
      .filter("attrs->>mediaId", "eq", mediaId),
  ]);

  if ((checks[0].count ?? 0) > 0) return "Media is used as OG image on a post.";
  if ((checks[1].count ?? 0) > 0) return "Media is used as OG image on a page.";
  if ((checks[2].count ?? 0) > 0) return "Media is used as site default OG image.";
  if ((checks[3].count ?? 0) > 0) return "Media is referenced in post content blocks.";
  if ((checks[4].count ?? 0) > 0) return "Media is referenced in page content blocks.";

  return null;
}

/**
 * Deletes a media file from storage and the index.
 */
export async function deleteMedia(
  _userId: string,
  workspaceId: string,
  mediaId: string,
): Promise<MediaActionResult> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) {
    return { success: false, error: guard.error, code: "forbidden" };
  }

  const supabase = await createClient();

  const { data: media, error: fetchError } = await supabase
    .from("media_files")
    .select("*")
    .eq("id", mediaId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (fetchError || !media) {
    return { success: false, error: "Media not found.", code: "not_found" };
  }

  const refError = await countMediaReferences(mediaId);
  if (refError) {
    return { success: false, error: refError };
  }

  await supabase.storage.from(WORKSPACE_MEDIA_BUCKET).remove([media.storage_path]);

  const { error } = await supabase.from("media_files").delete().eq("id", mediaId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
