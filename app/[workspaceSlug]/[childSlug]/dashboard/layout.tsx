import type { ReactNode } from "react";

import { WorkspaceDashboardShell } from "@/components/dashboard/workspace-dashboard-shell";

type ChildWorkspaceDashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; childSlug: string }>;
};

export default async function ChildWorkspaceDashboardLayout({
  children,
  params,
}: ChildWorkspaceDashboardLayoutProps) {
  const { workspaceSlug, childSlug } = await params;

  return (
    <WorkspaceDashboardShell parentSlug={workspaceSlug} childSlug={childSlug}>
      {children}
    </WorkspaceDashboardShell>
  );
}
