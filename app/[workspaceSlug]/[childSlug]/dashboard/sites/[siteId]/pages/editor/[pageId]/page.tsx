import { SitePageEditorPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Page editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string; siteId: string; pageId: string }>;
};

export default function ChildSitePageEditorRoute(props: PageProps) {
  return <SitePageEditorPage params={props.params} />;
}
