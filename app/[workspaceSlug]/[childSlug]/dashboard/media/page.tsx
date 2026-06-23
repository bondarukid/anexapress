import { MediaLibraryPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Media library",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; childSlug: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function ChildMediaPage(props: PageProps) {
  return (
    <MediaLibraryPage
      params={props.params.then((p) => ({
        workspaceSlug: p.workspaceSlug,
        childSlug: p.childSlug,
      }))}
      searchParams={props.searchParams}
    />
  );
}
