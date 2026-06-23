import { createClient } from "@/lib/server";
import { PERM_CONTENT_CREATE } from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type { SiteActionResult } from "@/types/site";

const SITE_FILES_BUCKET = "site-files";

export type SiteFileRecord = {
  id: string;
  workspaceId: string;
  siteId: string;
  bucket: string;
  storagePath: string;
  publicPath: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

function mapSiteFileRow(row: {
  id: string;
  workspace_id: string;
  site_id: string;
  bucket: string;
  storage_path: string;
  public_path: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
}): SiteFileRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    siteId: row.site_id,
    bucket: row.bucket,
    storagePath: row.storage_path,
    publicPath: row.public_path,
    filename: row.filename,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
  };
}

function normalizePublicPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.replace(/\/+/g, "/");
}

function buildStoragePath(siteId: string, publicPath: string): string {
  const relative = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return `${siteId}/${relative}`;
}

export async function listSiteFiles(siteId: string): Promise<SiteFileRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_files")
    .select("*")
    .eq("site_id", siteId)
    .order("public_path", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSiteFileRow);
}

export async function getSiteFileByPublicPath(
  siteId: string,
  publicPath: string,
): Promise<SiteFileRecord | null> {
  const supabase = await createClient();
  const normalized = normalizePublicPath(publicPath);

  const { data, error } = await supabase
    .from("site_files")
    .select("*")
    .eq("site_id", siteId)
    .eq("public_path", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return mapSiteFileRow(data);
}

export async function uploadSiteFile(
  userId: string,
  workspaceId: string,
  siteId: string,
  publicPath: string,
  file: File,
): Promise<SiteActionResult<{ fileId: string }>> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();
  const normalizedPath = normalizePublicPath(publicPath);
  const storagePath = buildStoragePath(siteId, normalizedPath);
  const filename = normalizedPath.split("/").pop() ?? "file";

  const { data: existing } = await supabase
    .from("site_files")
    .select("id")
    .eq("site_id", siteId)
    .eq("public_path", normalizedPath)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "A file already exists at this path.", code: "validation" };
  }

  const { error: uploadError } = await supabase.storage
    .from(SITE_FILES_BUCKET)
    .upload(storagePath, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data, error } = await supabase
    .from("site_files")
    .insert({
      workspace_id: workspaceId,
      site_id: siteId,
      bucket: SITE_FILES_BUCKET,
      storage_path: storagePath,
      public_path: normalizedPath,
      filename,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    await supabase.storage.from(SITE_FILES_BUCKET).remove([storagePath]);
    return { success: false, error: error?.message ?? "Failed to save file record." };
  }

  return { success: true, data: { fileId: data.id } };
}

export async function createSiteTextFile(
  userId: string,
  workspaceId: string,
  siteId: string,
  publicPath: string,
  content: string,
  mimeType = "text/plain",
): Promise<SiteActionResult<{ fileId: string }>> {
  const blob = new Blob([content], { type: mimeType });
  const filename = publicPath.split("/").pop() ?? "file.txt";
  const file = new File([blob], filename, { type: mimeType });
  return uploadSiteFile(userId, workspaceId, siteId, publicPath, file);
}

export async function deleteSiteFile(
  workspaceId: string,
  siteId: string,
  fileId: string,
): Promise<SiteActionResult> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();
  const { data: record } = await supabase
    .from("site_files")
    .select("storage_path, bucket")
    .eq("id", fileId)
    .eq("site_id", siteId)
    .maybeSingle();

  if (!record) return { success: false, error: "File not found.", code: "not_found" };

  await supabase.storage.from(record.bucket).remove([record.storage_path]);

  const { error } = await supabase.from("site_files").delete().eq("id", fileId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function fetchSiteFileBody(record: SiteFileRecord): Promise<ArrayBuffer> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(record.bucket).download(record.storagePath);
  if (error || !data) throw new Error(error?.message ?? "Failed to download file");
  return data.arrayBuffer();
}

export { SITE_FILES_BUCKET };
