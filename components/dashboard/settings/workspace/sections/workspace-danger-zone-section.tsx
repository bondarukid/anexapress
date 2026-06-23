"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, ArrowRightLeftIcon, LogOutIcon, Trash2Icon } from "lucide-react";

import { deleteWorkspaceAction } from "@/actions/workspace/delete-workspace";
import { leaveWorkspaceAction } from "@/actions/team/leave-workspace";
import { DestructiveAlertDialog } from "@/components/alert-dialogs";
import { MemberRemovalDialog } from "@/components/dashboard/team/member-removal-dialog";
import { WorkspaceTransferDialog } from "@/components/dashboard/team/workspace-transfer/workspace-transfer-dialog";
import { SettingsSectionLayout } from "@/components/dashboard/settings/workspace/settings-section-layout";
import { toast } from "@/components/toasts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamActiveMember } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";
import type { WorkspaceTransferSummary } from "@/types/workspace-transfer";

type WorkspaceDangerZoneSectionProps = {
  workspace: WorkspaceSummary;
  currentUserId: string;
  members: TeamActiveMember[];
  activeMemberCount: number;
  pendingTransfer: WorkspaceTransferSummary | null;
  canTransfer: boolean;
  canDelete: boolean;
  isOwner: boolean;
};

export function WorkspaceDangerZoneSection({
  workspace,
  currentUserId,
  members,
  activeMemberCount,
  pendingTransfer,
  canTransfer,
  canDelete,
  isOwner,
}: WorkspaceDangerZoneSectionProps) {
  const router = useRouter();
  const isSoloWorkspace = activeMemberCount <= 1;

  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const [leaveLoading, setLeaveLoading] = React.useState(false);
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleLeave = async () => {
    setLeaveLoading(true);
    try {
      const result = await leaveWorkspaceAction({
        workspaceId: workspace.id,
        workspaceSlug: workspace.slug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("You left the workspace");
      setLeaveOpen(false);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteWorkspaceAction({
        workspaceId: workspace.id,
        workspaceSlug: workspace.pathKey ?? workspace.slug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Workspace deleted");
      setDeleteOpen(false);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SettingsSectionLayout
      title="Danger zone"
      description="Manage irreversible workspace actions including leaving, transferring ownership, or deleting the workspace."
    >
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-medium">Leave workspace</h4>
                <p className="text-muted-foreground text-sm">
                  {isOwner
                    ? "Owners must transfer ownership before leaving this workspace."
                    : "Revoke your access to this workspace. You can rejoin only if another member invites you."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10 shrink-0 max-sm:w-full"
                disabled={isOwner}
                onClick={() => setLeaveOpen(true)}
              >
                <LogOutIcon />
                Leave workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        {canTransfer ? (
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-medium">Transfer ownership</h4>
                  <p className="text-muted-foreground text-sm">
                    Assign workspace ownership to another admin before you leave or delete your
                    account.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 max-sm:w-full"
                  onClick={() => setTransferOpen(true)}
                >
                  <ArrowRightLeftIcon />
                  Transfer ownership
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {canDelete ? (
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-medium">Delete workspace</h4>
                  <p className="text-muted-foreground text-sm">
                    {isSoloWorkspace
                      ? "Permanently delete this workspace and all associated data. This cannot be undone."
                      : "Remove all other members before deleting this workspace."}
                  </p>
                </div>
                <DestructiveAlertDialog
                  open={deleteOpen}
                  onOpenChange={setDeleteOpen}
                  trigger={
                    <Button
                      type="button"
                      variant="destructive"
                      className="shrink-0 max-sm:w-full"
                      disabled={!isSoloWorkspace}
                    >
                      <Trash2Icon />
                      Delete workspace
                    </Button>
                  }
                  title="Delete workspace?"
                  icon={AlertTriangleIcon}
                  iconLayout="inline"
                  badge="Permanent Action"
                  description="This will permanently delete the workspace, its members, settings, and all associated data. This cannot be undone."
                  confirmLabel="Delete workspace"
                  onConfirm={handleDelete}
                  confirmLoading={deleteLoading}
                  cancelDisabled={deleteLoading}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <MemberRemovalDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        mode="leave"
        memberName="You"
        workspaceName={workspace.name}
        confirmLoading={leaveLoading}
        onConfirm={() => void handleLeave()}
      />

      {canTransfer ? (
        <WorkspaceTransferDialog
          open={transferOpen}
          onOpenChange={setTransferOpen}
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          workspaceName={workspace.name}
          members={members}
          currentUserId={currentUserId}
          pendingTransfer={pendingTransfer}
          onTransferChanged={() => router.refresh()}
        />
      ) : null}
    </SettingsSectionLayout>
  );
}
