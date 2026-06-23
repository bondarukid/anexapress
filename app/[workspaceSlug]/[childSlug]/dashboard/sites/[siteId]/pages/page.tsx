import { SitePagesListPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site pages",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string; siteId: string }>;
};

export default function ChildSitePagesPage(props: PageProps) {
  return <SitePagesListPage params={props.params} />;
}
