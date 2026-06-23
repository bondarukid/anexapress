import { SitePageEditorPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Page editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; pageId: string }>;
};

export default function WorkspaceSitePageEditorRoute(props: PageProps) {
  return <SitePageEditorPage params={props.params} />;
}
