import { SitePostEditorPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; siteId: string; postId: string }>;
};

export default function ChildEditorSitePostPage(props: PageProps) {
  return <SitePostEditorPage params={props.params} />;
}
