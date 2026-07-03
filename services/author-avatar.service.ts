import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/admin";
import { buildAuthorAvatarPublicPath } from "@/lib/cms/author-avatar-public";
import { createClient } from "@/lib/server";
import { getProfileAvatarUrlByUserId } from "@/services/user";

const AVATAR_OBJECT_PATHS = (userId: string) =>
  [
    `${userId}/avatar.webp`,
    `${userId}/avatar.jpg`,
    `${userId}/avatar.jpeg`,
    `${userId}/avatar.png`,
  ] as const;

function supabasePublicStorageBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!raw?.trim()) return null;
  return raw.replace(/\/$/, "");
}

function contentTypeForAvatarPath(path: string): string {
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function resolveFetchedImageContentType(url: string, header: string | null): string {
  const normalized = header?.split(";")[0]?.trim().toLowerCase();
  if (normalized?.startsWith("image/")) return normalized;

  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(".webp")) return "image/webp";
  if (lowerUrl.includes(".png")) return "image/png";
  if (lowerUrl.includes(".gif")) return "image/gif";

  return "image/jpeg";
}

export type SitePublicSlugs = {
  workspaceSlug: string;
  siteSlug: string;
  primaryDomain: string | null;
};

/**
 * Resolves workspace/site slugs for building public author-avatar proxy paths.
 */
export async function getSitePublicSlugs(siteId: string): Promise<SitePublicSlugs | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("slug, primary_domain, workspaces!inner(slug)")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !data) return null;

  const workspaceRow = data.workspaces;
  const workspace = Array.isArray(workspaceRow) ? workspaceRow[0] : workspaceRow;
  if (!workspace?.slug) return null;

  return {
    workspaceSlug: workspace.slug,
    siteSlug: data.slug,
    primaryDomain: data.primary_domain,
  };
}

/**
 * Returns true when the user has at least one published post on the site (public author).
 * Uses the service role when available so anonymous readers are not blocked by workspace RLS.
 */
export async function isPublishedAuthorOnSite(siteId: string, userId: string): Promise<boolean> {
  if (isSupabaseAdminConfigured()) {
    try {
      const admin = await createAdminClient();
      const { count, error } = await admin
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId)
        .eq("created_by", userId)
        .eq("status", "published");

      if (!error) return (count ?? 0) > 0;
    } catch {
      // Fall back to the session-scoped client below.
    }
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)
    .eq("created_by", userId)
    .eq("status", "published");

  if (error) return false;
  return (count ?? 0) > 0;
}

async function probePublicAvatarStorage(userId: string): Promise<boolean> {
  const base = supabasePublicStorageBase();
  if (!base) return false;

  for (const path of AVATAR_OBJECT_PATHS(userId)) {
    const url = `${base}/storage/v1/object/public/avatars/${path}`;
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (response.ok) return true;
    } catch {
      // Try the next extension.
    }
  }

  return false;
}

/**
 * Whether the user has a profile avatar available for the public proxy route.
 */
export async function hasProfileAvatar(userId: string): Promise<boolean> {
  if (await probePublicAvatarStorage(userId)) return true;

  if (!isSupabaseAdminConfigured()) return false;

  try {
    const admin = await createAdminClient();
    for (const path of AVATAR_OBJECT_PATHS(userId)) {
      const { data, error } = await admin.storage.from("avatars").download(path);
      if (!error && data) return true;
    }
  } catch {
    // Fall through to profile URL lookup.
  }

  const storageUrl = await getProfileAvatarUrlByUserId(userId);
  return Boolean(storageUrl?.trim());
}

/**
 * Public proxied avatar path when the author has a profile image; otherwise null.
 */
export async function resolveProxiedAuthorAvatarUrl(input: {
  siteSlugs: SitePublicSlugs;
  userId: string;
}): Promise<string | null> {
  if (!(await hasProfileAvatar(input.userId))) return null;

  return buildAuthorAvatarPublicPath({
    workspaceSlug: input.siteSlugs.workspaceSlug,
    siteSlug: input.siteSlugs.siteSlug,
    primaryDomain: input.siteSlugs.primaryDomain,
    userId: input.userId,
  });
}

export type ProxiedAvatarPayload = {
  body: ArrayBuffer;
  contentType: string;
};

/**
 * Fetches profile avatar bytes server-side (storage URL never sent to the client).
 */
async function fetchAvatarFromPublicStorage(userId: string): Promise<ProxiedAvatarPayload | null> {
  const base = supabasePublicStorageBase();
  if (!base) return null;

  for (const path of AVATAR_OBJECT_PATHS(userId)) {
    const url = `${base}/storage/v1/object/public/avatars/${path}`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;

      const body = await response.arrayBuffer();
      if (body.byteLength === 0) continue;

      return {
        body,
        contentType: resolveFetchedImageContentType(url, response.headers.get("content-type")),
      };
    } catch {
      // Try the next extension.
    }
  }

  return null;
}

/**
 * Fetches profile avatar bytes server-side (storage URL never sent to the client).
 */
export async function fetchProfileAvatarPayload(
  userId: string,
): Promise<ProxiedAvatarPayload | null> {
  const fromPublicStorage = await fetchAvatarFromPublicStorage(userId);
  if (fromPublicStorage) return fromPublicStorage;

  if (isSupabaseAdminConfigured()) {
    try {
      const admin = await createAdminClient();
      for (const path of AVATAR_OBJECT_PATHS(userId)) {
        const { data, error } = await admin.storage.from("avatars").download(path);
        if (error || !data) continue;

        return {
          body: await data.arrayBuffer(),
          contentType: contentTypeForAvatarPath(path),
        };
      }
    } catch {
      // Fall back to profile URL fetch below.
    }
  }

  const storageUrl = await getProfileAvatarUrlByUserId(userId);
  if (!storageUrl) return null;

  const upstream = await fetch(storageUrl, { cache: "no-store" });
  if (!upstream.ok) return null;

  const body = await upstream.arrayBuffer();
  if (body.byteLength === 0) return null;

  return {
    body,
    contentType: resolveFetchedImageContentType(storageUrl, upstream.headers.get("content-type")),
  };
}
