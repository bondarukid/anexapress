import { ContentListPage, ContentNewPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "Content",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function ChildWorkspaceContentPage(props: PageProps) {
  return (
    <ContentListPage
      params={props.params.then((p) => ({
        workspaceSlug: p.workspaceSlug,
        childSlug: p.childSlug,
      }))}
      searchParams={props.searchParams}
    />
  );
}
