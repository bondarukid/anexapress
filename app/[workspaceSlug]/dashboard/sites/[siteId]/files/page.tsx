import { SiteFilesListPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Files",
  description: "File manager for site media and root files.",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string }>;
};

export default function WorkspaceSiteFilesPage(props: PageProps) {
  return <SiteFilesListPage params={props.params} />;
}
