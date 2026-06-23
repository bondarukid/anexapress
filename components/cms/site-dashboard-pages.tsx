import { notFound, redirect } from "next/navigation";

import { SiteOverview } from "@/components/dashboard/overview/site-overview";
import { SiteFileManagerDashboard } from "@/components/cms/files/site-file-manager-dashboard";
import { SiteLayoutBuilder } from "@/components/cms/site/site-layout-builder";
import { SitePageEditorShell } from "@/components/cms/site/site-page-editor-shell";
import { SitePagesTable } from "@/components/cms/site/site-pages-table";
import { SiteSettingsForm } from "@/components/cms/site/site-settings-form";
import { SitesTable } from "@/components/cms/site/sites-table";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { ENABLE_MULTI_SITE } from "@/lib/config/feature-flags";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { buildSiteFileManagerData } from "@/lib/cms/site-file-manager-stats";
import { getSiteLayout } from "@/services/site-layout.service";
import {
  getSitePageEditorData,
  listSitePageVersions,
  listSitePages,
} from "@/services/site-page.service";
import { getSiteById, listSites } from "@/services/site.service";
import { listSiteDomains } from "@/services/site-domain.service";
import { getCurrentUser } from "@/services/user";
import { getWorkspaceAccessPermissions } from "@/services/team";

type SiteDashboardParams = {
  workspaceSlug: string;
  slug?: string;
  siteId?: string;
  pageId?: string;
};

export async function SitesListPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const sites = await listSites(workspace.id);

  if (!ENABLE_MULTI_SITE) {
    const defaultSite = sites.find((s) => s.isDefault) ?? sites[0];
    if (defaultSite) {
      redirect(workspacePathFromSummary(workspace, `/sites/${defaultSite.id}/overview`));
    }
  }

  return <SitesTable sites={sites} workspaceId={workspace.id} />;
}

export async function SiteOverviewPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  if (!resolved.siteId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const site = await getSiteById(workspace.id, resolved.siteId);
  if (!site) notFound();

  const workspaceAccess = await getWorkspaceAccessPermissions(workspace.id);

  return <SiteOverview workspace={workspace} site={site} workspaceAccess={workspaceAccess} />;
}

export async function SitePagesListPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  if (!resolved.siteId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const site = await getSiteById(workspace.id, resolved.siteId);
  if (!site) notFound();

  const pages = await listSitePages(site.id);
  return (
    <SitePagesTable
      pages={pages}
      siteId={site.id}
      workspaceId={workspace.id}
      siteName={site.name}
    />
  );
}

export async function SiteLayoutPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  if (!resolved.siteId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const site = await getSiteById(workspace.id, resolved.siteId);
  if (!site) notFound();

  const layout = await getSiteLayout(site.id);
  if (!layout) notFound();

  return (
    <SiteLayoutBuilder
      layout={layout}
      site={site}
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      logoUrl={workspace.logoUrl}
    />
  );
}

export async function SiteSettingsPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  if (!resolved.siteId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const site = await getSiteById(workspace.id, resolved.siteId);
  if (!site) notFound();

  const pages = await listSitePages(site.id);
  const domains = await listSiteDomains(site.id);
  return (
    <SiteSettingsForm
      site={site}
      pages={pages}
      domains={domains}
      workspaceId={workspace.id}
    />
  );
}

export async function SiteFilesListPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  if (!resolved.siteId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const site = await getSiteById(workspace.id, resolved.siteId);
  if (!site) notFound();

  const fileManagerData = await buildSiteFileManagerData(workspace.id, site.id);

  return (
    <SiteFileManagerDashboard
      workspaceId={workspace.id}
      siteId={site.id}
      siteName={site.name}
      primaryDomain={site.primaryDomain}
      data={fileManagerData}
    />
  );
}

export async function SitePageEditorPage({ params }: { params: Promise<SiteDashboardParams> }) {
  const resolved = await params;
  if (!resolved.siteId || !resolved.pageId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(resolved, user.id);
  if (!workspace) notFound();

  const [editorData, versions] = await Promise.all([
    getSitePageEditorData(workspace.id, resolved.siteId, resolved.pageId),
    listSitePageVersions(resolved.siteId, resolved.pageId),
  ]);

  if (!editorData) notFound();

  return (
    <SitePageEditorShell
      data={editorData}
      versions={versions}
      workspaceId={workspace.id}
    />
  );
}
