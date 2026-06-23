import { SiteOverviewPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site overview",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; siteId: string }>;
};

export default function ChildSiteOverviewPage(props: PageProps) {
  return <SiteOverviewPage params={props.params} />;
}
