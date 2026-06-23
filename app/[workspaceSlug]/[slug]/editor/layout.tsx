import type { ReactNode } from "react";

import { EditorWorkspaceLayout } from "@/components/cms/editor/editor-workspace-layout";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default async function ChildWorkspaceEditorLayout({ children, params }: LayoutProps) {
  const { workspaceSlug, slug } = await params;
  return (
    <EditorWorkspaceLayout parentSlug={workspaceSlug} childSlug={slug}>
      {children}
    </EditorWorkspaceLayout>
  );
}
