import type { Metadata } from "next";

import { buildSiteCanonicalUrl } from "@/lib/cms/site-canonical";
import type { Site, SiteVerificationMetaTag } from "@/types/site";

type BuildSitePublicMetadataInput = {
  workspaceSlug: string;
  siteSlug: string;
  site: Site;
  path?: string;
  title?: string;
  description?: string;
};

/**
 * Builds Next.js metadata for public site pages, including verification meta tags.
 */
export async function buildSitePublicMetadata({
  workspaceSlug,
  siteSlug,
  site,
  path = "/",
  title,
  description,
}: BuildSitePublicMetadataInput): Promise<Metadata> {
  const verificationOther = buildVerificationMetadataOther(site.verificationMetaTags);
  const canonicalUrl = await buildSiteCanonicalUrl({
    workspaceSlug,
    siteSlug,
    primaryDomain: site.primaryDomain,
    path,
  });

  return {
    metadataBase: new URL(canonicalUrl),
    title: title ?? site.seoDefaultTitle ?? site.name,
    description: description ?? site.seoDefaultDescription ?? undefined,
    alternates: { canonical: canonicalUrl },
    other: Object.keys(verificationOther).length > 0 ? verificationOther : undefined,
  };
}

/**
 * Maps stored verification tags to Next.js `metadata.other` name/content pairs.
 */
export function buildVerificationMetadataOther(
  tags: SiteVerificationMetaTag[],
): Record<string, string> {
  const other: Record<string, string> = {};
  for (const tag of tags) {
    other[tag.name] = tag.content;
  }
  return other;
}
