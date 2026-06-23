export type MediaFile = {
  id: string;
  workspaceId: string;
  siteId: string | null;
  storagePath: string;
  bucket: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  publicUrl: string;
  createdBy: string;
  createdAt: string;
};

export type MediaActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string; code?: "not_found" | "forbidden" };
