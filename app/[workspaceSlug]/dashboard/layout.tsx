import type { ReactNode } from "react";

import { WorkspaceDashboardShell } from "@/components/dashboard/workspace-dashboard-shell";

type WorkspaceDashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceDashboardLayout({
  children,
  params,
}: WorkspaceDashboardLayoutProps) {
  const { workspaceSlug } = await params;

  return (
    <WorkspaceDashboardShell parentSlug={workspaceSlug}>{children}</WorkspaceDashboardShell>
  );
}
