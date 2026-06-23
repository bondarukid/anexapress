import { SiteDashboardIndexRedirect } from "@/components/dashboard/site-dashboard-layout";

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; siteId: string }>;
};

export default async function ChildSiteDashboardIndexPage({ params }: PageProps) {
  return SiteDashboardIndexRedirect({ params });
}
