import { SiteFilesListPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site files",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string; siteId: string }>;
};

export default function ChildSiteFilesPage(props: PageProps) {
  return <SiteFilesListPage params={props.params} />;
}
