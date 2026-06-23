import { redirect } from "next/navigation";

import { getDefaultSiteSlug } from "@/lib/cms/resolve-site";

type LegacyPostRedirectProps = {
  params: Promise<{ workspaceSlug: string; postSlug: string }>;
};

export default async function LegacyBlogPostRedirect({ params }: LegacyPostRedirectProps) {
  const { workspaceSlug, postSlug } = await params;
  const siteSlug = await getDefaultSiteSlug(workspaceSlug);
  if (!siteSlug) redirect(`/${workspaceSlug}`);
  redirect(`/${workspaceSlug}/${siteSlug}/blog/${postSlug}`);
}
