import { SitesListPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Sites",
  description: "Manage workspace sites.",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
};

export default function WorkspaceSitesPage(props: PageProps) {
  return <SitesListPage params={props.params} />;
}
