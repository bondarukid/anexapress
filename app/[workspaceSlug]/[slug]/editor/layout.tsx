import type { ReactNode } from "react";

import { WorkspaceDashboardShell } from "@/components/dashboard/workspace-dashboard-shell";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default async function ChildWorkspaceEditorLayout({ children, params }: LayoutProps) {
  const { workspaceSlug, slug } = await params;
  return (
    <WorkspaceDashboardShell parentSlug={workspaceSlug} childSlug={slug} showOnboarding={false}>
      {children}
    </WorkspaceDashboardShell>
  );
}
