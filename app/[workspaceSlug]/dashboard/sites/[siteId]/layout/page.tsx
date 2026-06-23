import { SiteLayoutPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site layout",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string }>;
};

export default function WorkspaceSiteLayoutPage(props: PageProps) {
  return <SiteLayoutPage params={props.params} />;
}
