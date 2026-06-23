import { SiteSettingsPage } from "@/components/cms/site-dashboard-pages";

export const metadata = {
  title: "Site settings",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string; siteId: string }>;
};

export default function ChildSiteSettingsPage(props: PageProps) {
  return <SiteSettingsPage params={props.params} />;
}
