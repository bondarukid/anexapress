import { SitesListPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Sites",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default function ChildWorkspaceSitesPage(props: PageProps) {
  return <SitesListPage params={props.params} />;
}
