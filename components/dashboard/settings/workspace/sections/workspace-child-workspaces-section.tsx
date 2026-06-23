"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { createChildWorkspaceAction } from "@/actions/workspace/create-child-workspace";
import { SettingsSectionLayout } from "@/components/dashboard/settings/workspace/settings-section-layout";
import { WorkspaceParentAttachDialog } from "@/components/dashboard/settings/workspace/workspace-parent-attach-dialog";
import { WorkspaceCreateFormFields } from "@/components/dashboard/workspace/workspace-create-form-fields";
import { toast } from "@/components/toasts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceSlugCheck } from "@/hooks/use-workspace-slug-check";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import {
  defaultWorkspaceCreateFormValues,
  isWorkspaceCreateFormValid,
  type WorkspaceCreateFormValues,
} from "@/lib/ui/workspace-create-form";
import type { ChildWorkspaceSummary } from "@/services/workspace-family";
import type {
  ParentAttachAcceptor,
  WorkspaceParentAttachSummary,
} from "@/types/workspace-transfer";

type WorkspaceChildWorkspacesSectionProps = {
  parentWorkspaceId: string;
  parentSlug: string;
  parentName: string;
  childWorkspaces: ChildWorkspaceSummary[];
  attachableWorkspaces: ChildWorkspaceSummary[];
  parentAcceptors: ParentAttachAcceptor[];
  pendingParentAttach: WorkspaceParentAttachSummary | null;
};

export function WorkspaceChildWorkspacesSection({
  parentWorkspaceId,
  parentSlug,
  parentName,
  childWorkspaces,
  attachableWorkspaces,
  parentAcceptors,
  pendingParentAttach,
}: WorkspaceChildWorkspacesSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [attachOpen, setAttachOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<WorkspaceCreateFormValues>(() =>
    defaultWorkspaceCreateFormValues(),
  );

  const slugCheck = useWorkspaceSlugCheck(
    values.workspaceUrl,
    400,
    undefined,
    undefined,
    parentWorkspaceId,
  );

  const canSubmitCreate = isWorkspaceCreateFormValid(values, slugCheck);
  const canAttach = attachableWorkspaces.length > 0 || pendingParentAttach !== null;

  async function handleCreate() {
    if (!canSubmitCreate) return;
    setIsSubmitting(true);
    try {
      const result = await createChildWorkspaceAction({
        parentWorkspaceId,
        workspaceName: values.workspaceName.trim(),
        workspaceUrl: values.workspaceUrl.trim(),
        timezone: values.timezone,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Child workspace created");
      setCreateOpen(false);
      setValues(defaultWorkspaceCreateFormValues());
      router.push(
        workspacePathFromSummary({
          ...result.workspace,
          parentSlug,
          isChild: true,
        }),
      );
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SettingsSectionLayout
      title="Child workspaces"
      description="Create or attach workspaces under this parent. Child workspaces share organizational ownership with the parent."
    >
      <div className="flex flex-col gap-4">
        {pendingParentAttach ? (
          <div className="rounded-lg border border-amber-600/30 bg-amber-600/5 p-4 text-sm">
            <p className="font-medium">Attach in progress</p>
            <p className="text-muted-foreground mt-1">
              {pendingParentAttach.sourceWorkspaceName} is pending attach under {parentName}.
              Representative: {pendingParentAttach.acceptorDisplayName}
              {pendingParentAttach.recipientConfirmedAt
                ? " — accepted, ready to finalize."
                : " — waiting for acceptance."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setAttachOpen(true)}
            >
              View attach status
            </Button>
          </div>
        ) : null}

        {childWorkspaces.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {childWorkspaces.map((child) => (
              <li
                key={child.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-muted-foreground text-xs">
                    /{parentSlug}/{child.slug}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      workspacePathFromSummary({
                        id: child.id,
                        name: child.name,
                        slug: child.slug,
                        logoUrl: child.logoUrl,
                        websiteUrl: null,
                        timezone: child.timezone,
                        roleSlug: "admin",
                        parentId: parentWorkspaceId,
                        parentSlug,
                        isChild: true,
                        pathKey: `${parentSlug}/${child.slug}`,
                      }),
                    )
                  }
                >
                  Open
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No child workspaces yet.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" data-icon="inline-start" />
            Create child workspace
          </Button>
          {canAttach ? (
            <Button type="button" variant="outline" onClick={() => setAttachOpen(true)}>
              Attach existing workspace
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create child workspace</DialogTitle>
            <DialogDescription>
              A new workspace nested under {parentSlug}. You will be added as an admin member.
            </DialogDescription>
          </DialogHeader>
          <WorkspaceCreateFormFields
            values={values}
            onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
            parentWorkspaceId={parentWorkspaceId}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSubmitCreate || isSubmitting}
              onClick={() => void handleCreate()}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WorkspaceParentAttachDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        parentWorkspaceId={parentWorkspaceId}
        parentSlug={parentSlug}
        parentName={parentName}
        attachableWorkspaces={attachableWorkspaces}
        acceptors={parentAcceptors}
        pendingAttach={pendingParentAttach}
        onAttachChanged={() => router.refresh()}
      />
    </SettingsSectionLayout>
  );
}
