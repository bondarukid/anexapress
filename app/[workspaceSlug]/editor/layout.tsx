import type { ReactNode } from "react";

import { EditorWorkspaceLayout } from "@/components/cms/editor/editor-workspace-layout";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceEditorLayout({ children, params }: LayoutProps) {
  const { workspaceSlug } = await params;
  return (
    <EditorWorkspaceLayout parentSlug={workspaceSlug}>{children}</EditorWorkspaceLayout>
  );
}
