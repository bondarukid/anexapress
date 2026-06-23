import type { ReactNode } from "react";

export type CreateWorkspaceDialogBlockProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  warningTitle?: string;
  warningDescription?: string;
  workspaceNameLabel?: string;
  workspaceNamePlaceholder?: string;
  cancelLabel?: string;
  createLabel?: string;
  defaultWorkspaceName?: string;
  onCancel?: () => void;
  onCreate?: (payload: { name: string }) => void;
  className?: string;
};
