import { redirect } from "next/navigation";

import { redirectToDefaultSiteSection } from "@/lib/dashboard/redirect-to-site-section";
import { getCurrentUser } from "@/services/user";

type PageProps = {
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default async function ChildWorkspaceContentNewRedirectPage({ params }: PageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await redirectToDefaultSiteSection(routeParams, user.id, "/content");
}
