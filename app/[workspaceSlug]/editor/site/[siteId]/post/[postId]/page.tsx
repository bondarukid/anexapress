import { SitePostEditorPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; postId: string; slug?: string }>;
};

export default function EditorSitePostPage(props: PageProps) {
  return <SitePostEditorPage params={props.params} />;
}
