import { SiteOverviewPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site overview",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
};

export default function SiteOverviewRoute(props: PageProps) {
  return <SiteOverviewPage params={props.params} />;
}
