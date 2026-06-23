import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { SiteLayout } from "@/components/site-shell/site-layout";
import { buildSiteBasePath, getSiteBySlug } from "@/lib/cms/resolve-site";
import { getMediaById } from "@/services/media.service";

type WorkspaceSiteLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; siteSlug: string }>;
};

export default async function WorkspaceSiteLayout({ children, params }: WorkspaceSiteLayoutProps) {
  const { workspaceSlug, siteSlug } = await params;
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
