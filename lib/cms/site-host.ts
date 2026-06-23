import { isDocsHost } from "@/lib/docs/host";
import { getPlatformSiteUrl, isApexHost } from "@/lib/platform/host";
import type { ResolvedSiteByDomain } from "@/types/site";
import type { SupabaseClient } from "@supabase/supabase-js";

const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  data: ResolvedSiteByDomain | null;
  expiresAt: number;
};

const domainCache = new Map<string, CacheEntry>();

const ROOT_FILE_PATTERN =
  /^\/(\.well-known\/[^/]+(?:\/[^/]+)*|app-ads\.txt|ads\.txt|robots\.txt|sitemap\.xml)$/i;

/** Strip port and lowercase hostname. */
export function normalizeHostname(host: string): string {
  return host.split(":")[0].toLowerCase();
}

/** Paths served from site_files at site root (custom domain). */
export function isSiteRootFilePath(path: string): boolean {
  return ROOT_FILE_PATTERN.test(path);
}

/** Hostnames handled by platform/docs/apex routing — not custom site domains. */
export function isReservedPlatformHost(host: string): boolean {
  if (isDocsHost(host) || isApexHost(host)) return true;

  const platformHost = process.env.PLATFORM_HOST?.trim().toLowerCase();
  const normalized = normalizeHostname(host);
  if (platformHost && normalized === platformHost) return true;

  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL;
  if (platformUrl) {
    try {
      if (normalizeHostname(new URL(platformUrl).host) === normalized) return true;
    } catch {
      // ignore invalid URL
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      if (normalizeHostname(new URL(siteUrl).host) === normalized) return true;
    } catch {
      // ignore
    }
  }

  return false;
}

export async function lookupSiteByDomain(
  supabase: SupabaseClient,
  hostname: string,
): Promise<ResolvedSiteByDomain | null> {
  const domain = normalizeHostname(hostname);
  const cached = domainCache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from("site_domains")
    .select(
      "domain, site_id, sites!inner(id, slug, primary_domain, workspace_id, workspaces!inner(id, slug))",
    )
    .eq("domain", domain)
    .maybeSingle();

  if (error || !data) {
    domainCache.set(domain, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  }

  const siteRow = data.sites;
  const site = (Array.isArray(siteRow) ? siteRow[0] : siteRow) as {
    id: string;
    slug: string;
    primary_domain: string | null;
    workspace_id: string;
    workspaces: { id: string; slug: string } | { id: string; slug: string }[];
  } | null;

  if (!site) {
    domainCache.set(domain, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  }

  const workspaceRow = site.workspaces;
  const workspace = Array.isArray(workspaceRow) ? workspaceRow[0] : workspaceRow;

  const resolved: ResolvedSiteByDomain = {
    workspaceSlug: workspace.slug,
    workspaceId: workspace.id,
    siteSlug: site.slug,
    siteId: site.id,
    primaryDomain: site.primary_domain,
  };

  domainCache.set(domain, { data: resolved, expiresAt: Date.now() + CACHE_TTL_MS });
  return resolved;
}

/** Map incoming custom-domain path to internal App Router path. */
export function mapCustomDomainToInternalPath(
  resolved: ResolvedSiteByDomain,
  path: string,
): string {
  if (path === "/" || path === "") {
    return `/${resolved.workspaceSlug}/${resolved.siteSlug}`;
  }

  if (isSiteRootFilePath(path)) {
    const relative = path.startsWith("/") ? path.slice(1) : path;
    return `/${resolved.workspaceSlug}/${resolved.siteSlug}/root/${relative}`;
  }

  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `/${resolved.workspaceSlug}/${resolved.siteSlug}${suffix}`;
}

export function getPlatformHostHint(): string {
  try {
    return normalizeHostname(new URL(getPlatformSiteUrl()).host);
  } catch {
    return process.env.PLATFORM_HOST?.trim().toLowerCase() ?? "your-platform.example.com";
  }
}
