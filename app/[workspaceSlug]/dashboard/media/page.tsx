import { MediaLibraryPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Media library",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ site?: string }>;
};

export default function WorkspaceMediaPage(props: PageProps) {
  return <MediaLibraryPage params={props.params} searchParams={props.searchParams} />;
}
