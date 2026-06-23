import { ContentListPage, ContentNewPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "Content",
  description: "Manage workspace blog posts.",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function WorkspaceContentPage(props: PageProps) {
  return <ContentListPage params={props.params} searchParams={props.searchParams} />;
}
