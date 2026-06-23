import { headers } from "next/headers";

import { getSiteOrigin } from "@/lib/auth/site-origin";
import { normalizeHostname } from "@/lib/cms/site-host";
import { buildSiteBasePath } from "@/lib/cms/site-paths";

type BuildSiteCanonicalUrlInput = {
  workspaceSlug: string;
  siteSlug: string;
  primaryDomain?: string | null;
  path?: string;
};

/**
 * Builds canonical public URL for a site page.
 * Uses custom domain when request host matches site primary domain.
 */
export async function buildSiteCanonicalUrl({
  workspaceSlug,
  siteSlug,
  primaryDomain,
  path = "",
}: BuildSiteCanonicalUrlInput): Promise<string> {
  const host = normalizeHostname((await headers()).get("host") ?? "");
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";

  if (primaryDomain && host === normalizeHostname(primaryDomain)) {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    return `${protocol}://${primaryDomain}${normalizedPath || "/"}`;
  }

  const origin = getSiteOrigin();
  const base = buildSiteBasePath(workspaceSlug, siteSlug);
  return `${origin}${base}${normalizedPath}`;
}
