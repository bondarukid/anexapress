import { SiteFilesListPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Files",
  description: "File manager for site media and root files.",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; siteId: string }>;
};

export default function ChildSiteFilesPage(props: PageProps) {
  return <SiteFilesListPage params={props.params} />;
}
