import type { ReactNode } from "react";

import { WorkspaceDashboardShell } from "@/components/dashboard/workspace-dashboard-shell";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceEditorLayout({ children, params }: LayoutProps) {
  const { workspaceSlug } = await params;
  return (
    <WorkspaceDashboardShell parentSlug={workspaceSlug} showOnboarding={false}>
      {children}
    </WorkspaceDashboardShell>
  );
}
