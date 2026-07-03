import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteLayout } from "@/components/site-shell/site-layout";
import { buildSitePublicMetadata } from "@/lib/cms/site-metadata";
import { buildSiteBasePath, getSiteBySlug } from "@/lib/cms/resolve-site";
import { getMediaById } from "@/services/media.service";

type WorkspaceSiteLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: WorkspaceSiteLayoutProps): Promise<Metadata> {
  const { workspaceSlug, slug: siteSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) return {};

  return buildSitePublicMetadata({
    workspaceSlug,
    siteSlug,
    site: resolved.site,
    path: "/",
  });
}

export default async function WorkspaceSiteLayout({ children, params }: WorkspaceSiteLayoutProps) {
  const { workspaceSlug, slug: siteSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);

  if (!resolved) notFound();

  const basePath = buildSiteBasePath(workspaceSlug, siteSlug);

  let logoUrl = resolved.workspaceLogoUrl;
  const logoMediaId = resolved.layout.headerConfig.logo.mediaId;
  if (logoMediaId) {
    const media = await getMediaById(logoMediaId);
    if (media) logoUrl = media.publicUrl;
  }

  return (
    <SiteLayout
      headerConfig={resolved.layout.headerConfig}
      footerConfig={resolved.layout.footerConfig}
      basePath={basePath}
      siteName={resolved.site.name}
      logoUrl={logoUrl}
    >
      {children}
    </SiteLayout>
  );
}
