import { ContentListPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "Blog posts",
  description: "Manage blog posts for this site.",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; siteId: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function ChildSiteContentPage(props: PageProps) {
  return <ContentListPage params={props.params} searchParams={props.searchParams} />;
}
