import type { ReactNode } from "react";

import { WorkspaceDashboardShell } from "@/components/dashboard/workspace-dashboard-shell";

type ChildWorkspaceDashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default async function ChildWorkspaceDashboardLayout({
  children,
  params,
}: ChildWorkspaceDashboardLayoutProps) {
  const { workspaceSlug, slug } = await params;

  return (
    <WorkspaceDashboardShell parentSlug={workspaceSlug} childSlug={slug}>
      {children}
    </WorkspaceDashboardShell>
  );
}
