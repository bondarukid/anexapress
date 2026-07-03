import { headers } from "next/headers";

import { getSiteOrigin } from "@/lib/auth/site-origin";
import { normalizeHostname } from "@/lib/cms/site-host";
import { buildSiteBasePath } from "@/lib/cms/site-paths";

type BuildAuthorAvatarPublicPathInput = {
  workspaceSlug: string;
  siteSlug: string;
  primaryDomain?: string | null;
  userId: string;
};

/**
 * Public URL path for a proxied author avatar (no direct storage URL exposed).
 * On a custom domain: `/author-avatar/{userId}`; on platform path: `/{ws}/{site}/author-avatar/{userId}`.
 */
export async function buildAuthorAvatarPublicPath({
  workspaceSlug,
  siteSlug,
  primaryDomain,
  userId,
}: BuildAuthorAvatarPublicPathInput): Promise<string> {
  const suffix = `/author-avatar/${userId}`;
  const host = normalizeHostname((await headers()).get("host") ?? "");

  if (primaryDomain && host === normalizeHostname(primaryDomain)) {
    return suffix;
  }

  return `${buildSiteBasePath(workspaceSlug, siteSlug)}${suffix}`;
}

/**
 * Absolute public URL for metadata or contexts that require a full URL.
 */
export async function buildAuthorAvatarPublicUrl(
  input: BuildAuthorAvatarPublicPathInput,
): Promise<string> {
  const path = await buildAuthorAvatarPublicPath(input);
  const host = normalizeHostname((await headers()).get("host") ?? "");

  if (input.primaryDomain && host === normalizeHostname(input.primaryDomain)) {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    return `${protocol}://${input.primaryDomain}${path}`;
  }

  return `${getSiteOrigin()}${path}`;
}
