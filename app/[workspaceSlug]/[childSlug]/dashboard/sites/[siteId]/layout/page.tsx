import { SiteLayoutPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site layout",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string; siteId: string }>;
};

export default function ChildSiteLayoutPage(props: PageProps) {
  return <SiteLayoutPage params={props.params} />;
}
