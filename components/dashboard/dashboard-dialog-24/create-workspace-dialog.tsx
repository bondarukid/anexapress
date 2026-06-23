"use client";

/**
 * Shadcn Studio — Dashboard Dialog 24
 * Блок создания воркспейса (Create Workspace)
 * @see https://shadcnstudio.com/blocks/dashboard-and-application/dashboard-dialog#dashboard-dialog-24
 */

import * as React from "react";
import type { FormEvent, MouseEventHandler } from "react";
import { cloneElement, isValidElement } from "react";
import { TriangleAlert } from "lucide-react";

import {
  CREATE_WORKSPACE_DIALOG_BLOCK_LABEL,
  defaultCreateWorkspaceCancelLabel,
  defaultCreateWorkspaceCreateLabel,
  defaultCreateWorkspaceDescription,
  defaultCreateWorkspaceTitle,
  defaultCreateWorkspaceWarningDescription,
  defaultCreateWorkspaceWarningTitle,
  defaultWorkspaceNameLabel,
  defaultWorkspaceNamePlaceholder,
} from "@/lib/dashboard-dialog-24/data";
import type { CreateWorkspaceDialogBlockProps } from "@/lib/dashboard-dialog-24/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getFieldLabelId } from "@/lib/ui/field-a11y";

export function CreateWorkspaceDialogBlock({
  open: openProp,
  defaultOpen,
  onOpenChange,
  trigger,
  title = defaultCreateWorkspaceTitle,
  description = defaultCreateWorkspaceDescription,
  warningTitle = defaultCreateWorkspaceWarningTitle,
  warningDescription = defaultCreateWorkspaceWarningDescription,
  workspaceNameLabel = defaultWorkspaceNameLabel,
  workspaceNamePlaceholder = defaultWorkspaceNamePlaceholder,
  cancelLabel = defaultCreateWorkspaceCancelLabel,
  createLabel = defaultCreateWorkspaceCreateLabel,
  defaultWorkspaceName = "",
  onCancel,
  onCreate,
  className,
}: CreateWorkspaceDialogBlockProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const [workspaceName, setWorkspaceName] = React.useState(defaultWorkspaceName);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;
    onCreate?.({ name });
    setOpen(false);
  };

  const triggerElement =
    trigger && isValidElement<{ onClick?: MouseEventHandler }>(trigger) ? (
      cloneElement(trigger, {
        onClick: (event) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        },
      })
    ) : trigger ? (
      <button type="button" className="inline-flex" onClick={() => setOpen(true)}>
        {trigger}
      </button>
    ) : null;

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
        <DialogContent className={cn("gap-0 overflow-hidden p-0 sm:max-w-md", className)}>
          <DialogHeader className="space-y-1.5 px-6 pt-6 text-left">
            <p className="text-muted-foreground text-xs font-medium">
              {CREATE_WORKSPACE_DIALOG_BLOCK_LABEL}
            </p>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate}>
            <div className="space-y-4 px-6 pb-4">
              <Alert>
                <TriangleAlert className="text-amber-600 dark:text-amber-500" />
                <AlertTitle>{warningTitle}</AlertTitle>
                <AlertDescription>{warningDescription}</AlertDescription>
              </Alert>

              <Field>
                <FieldLabel htmlFor="workspace-name" id={getFieldLabelId("workspace-name")}>
                  {workspaceNameLabel}
                  <span className="text-destructive" aria-hidden>
                    {" "}
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="workspace-name"
                  name="workspaceName"
                  placeholder={workspaceNamePlaceholder}
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  required
                  autoComplete="organization"
                />
              </Field>
            </div>

            <div className="bg-muted/50 flex justify-end gap-2 rounded-b-xl border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {cancelLabel}
              </Button>
              <Button type="submit" disabled={!workspaceName.trim()}>
                {createLabel}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
