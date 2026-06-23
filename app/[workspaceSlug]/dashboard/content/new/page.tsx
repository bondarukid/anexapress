import { ContentNewPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "New post",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function WorkspaceContentNewPage(props: PageProps) {
  return <ContentNewPage params={props.params} searchParams={props.searchParams} />;
}
