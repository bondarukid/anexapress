import { SiteDashboardIndexRedirect } from "@/components/dashboard/site-dashboard-layout";

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
};

export default async function SiteDashboardIndexPage({ params }: PageProps) {
  return SiteDashboardIndexRedirect({ params });
}
