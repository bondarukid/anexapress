import { redirect } from "next/navigation";

import { getDefaultSiteSlug } from "@/lib/cms/resolve-site";

type LegacyBlogRedirectProps = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function LegacyBlogIndexRedirect({ params }: LegacyBlogRedirectProps) {
  const { workspaceSlug } = await params;
  const siteSlug = await getDefaultSiteSlug(workspaceSlug);
  if (!siteSlug) redirect(`/${workspaceSlug}`);
  redirect(`/${workspaceSlug}/${siteSlug}/blog`);
}
