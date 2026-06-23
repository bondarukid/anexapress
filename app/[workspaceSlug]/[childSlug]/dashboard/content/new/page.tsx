import { ContentNewPage } from "@/components/cms/content-pages";

export const metadata = {
  title: "New post",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function ChildWorkspaceContentNewPage(props: PageProps) {
  return (
    <ContentNewPage
      params={props.params.then((p) => ({
        workspaceSlug: p.workspaceSlug,
        childSlug: p.childSlug,
      }))}
      searchParams={props.searchParams}
    />
  );
}
