import { SitePageEditorPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Page editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; pageId: string; slug?: string }>;
};

export default function EditorSitePageRoute(props: PageProps) {
  return <SitePageEditorPage params={props.params} />;
}
