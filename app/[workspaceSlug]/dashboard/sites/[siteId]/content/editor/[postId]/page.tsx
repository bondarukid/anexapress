import { SitePostEditorPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string; postId: string }>;
};

export default function SitePostEditorRoute(props: PageProps) {
  return <SitePostEditorPage params={props.params} />;
}
