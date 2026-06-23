"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, PlusIcon } from "lucide-react";

import { DestructiveAlertDialog } from "@/components/alert-dialogs";
import { InviteMemberDialog } from "@/components/dashboard/team/invite-member-dialog";
import { MemberPermissionsDialog } from "@/components/dashboard/team/member-permissions";
import { MemberRemovalDialog } from "@/components/dashboard/team/member-removal-dialog";
import { PendingInviteDetailsDialog } from "@/components/dashboard/team/pending-invite-details-dialog";
import { TeamMemberRow } from "@/components/dashboard/team/team-member-row";
import { TeamMembersGrid } from "@/components/dashboard/team/team-members-grid";
import { TeamMembersGridSkeleton } from "@/components/dashboard/team/team-members-grid-skeleton";
import { TeamMembersList } from "@/components/dashboard/team/team-members-list";
import { TeamMembersListSkeleton } from "@/components/dashboard/team/team-members-list-skeleton";
import { WorkspaceTransferDialog } from "@/components/dashboard/team/workspace-transfer";
import { MembersViewToggle } from "@/components/members";
import { useTeamManagement } from "@/hooks/use-team-management";
import { TEAM_MEMBERS_SKELETON_ROW_COUNT } from "@/lib/team/constants";
import {
  canChangeMemberVisibility,
  canManageMemberAccess,
  canManageOtherMemberRole,
  canManageWorkspaceMembers,
  canOpenSelfVisibilityMenu,
} from "@/lib/team/permissions";
import type { MemberViewMode } from "@/types/member-display";
import type {
  MemberRemovalMode,
  TeamActiveMember,
  TeamPageData,
  TeamPendingInvite,
  UpdateMemberAccessResult,
} from "@/types/team";
import type { WorkspaceTransferSummary } from "@/types/workspace-transfer";
import type { WorkspaceSummary } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TeamManagementProps = {
  initialData: TeamPageData;
  workspace: WorkspaceSummary;
  userId: string;
  canManageVisibility?: boolean;
  initialPendingTransfer?: WorkspaceTransferSummary | null;
};

export function TeamManagement({
  initialData,
  workspace,
  userId,
  canManageVisibility = false,
  initialPendingTransfer = null,
}: TeamManagementProps) {
  const router = useRouter();
  const workspaceSlug = workspace.pathKey ?? workspace.slug;
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<MemberViewMode>("list");
  const [workspaceFilter, setWorkspaceFilter] = React.useState<string>("all");
  const [detailsInvite, setDetailsInvite] = React.useState<TeamPendingInvite | null>(null);
  const [permissionsMemberId, setPermissionsMemberId] = React.useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = React.useState<{
    mode: MemberRemovalMode;
    member: TeamActiveMember;
  } | null>(null);
  const [transferPreAlertOpen, setTransferPreAlertOpen] = React.useState(false);
  const [transferWizardOpen, setTransferWizardOpen] = React.useState(false);
  const {
    data,
    pendingId,
    isRefetching,
    removeActiveMember,
    leaveWorkspace,
    revokePendingInvite,
    applyMemberAccessUpdate,
    refetchTeam,
  } = useTeamManagement({ initialData, workspaceSlug, userId });

  const canManage = canManageWorkspaceMembers(data.permissions);
  const canManageAccess = canManageMemberAccess(data.permissions);
  const isBusy = pendingId !== null;
  const skeletonCount = data.members.length || TEAM_MEMBERS_SKELETON_ROW_COUNT;
  const permissionsMember =
    permissionsMemberId !== null
      ? (data.members.find((member) => member.membershipId === permissionsMemberId) ?? null)
      : null;

  const filteredMembers = React.useMemo(() => {
    if (!data.isFamilyView || workspaceFilter === "all") {
      return data.members;
    }
    return data.members.filter((member) => member.workspaceId === workspaceFilter);
  }, [data.isFamilyView, data.members, workspaceFilter]);

  function handleMemberAccessSaved(membershipId: string, result: UpdateMemberAccessResult) {
    applyMemberAccessUpdate(membershipId, result);
    setPermissionsMemberId(null);
  }

  function handleManageAccess(membershipId: string) {
    const member = data.members.find((item) => item.membershipId === membershipId);
    if (!member) return;

    const isSelf = member.userId === userId;
    const canOpenForSelf =
      workspace.isChild && canOpenSelfVisibilityMenu(workspace.isChild ?? false, member, userId);
    const canOpenForOther = canManageOtherMemberRole(canManageAccess, member, userId);
    const canOpenForVisibility = canChangeMemberVisibility(canManageVisibility, member, userId);

    if (!canOpenForSelf && !canOpenForOther && !canOpenForVisibility) return;
    setPermissionsMemberId(membershipId);
  }

  function handleRequestRemoval(mode: MemberRemovalMode, member: TeamActiveMember) {
    setPendingRemoval({ mode, member });
  }

  async function handleConfirmRemoval() {
    if (!pendingRemoval) return;
    const success =
      pendingRemoval.mode === "leave"
        ? await leaveWorkspace()
        : await removeActiveMember(pendingRemoval.member.membershipId);
    if (success) {
      setPendingRemoval(null);
    }
  }

  function handleTransferChanged() {
    void refetchTeam();
    router.refresh();
  }

  const memberListProps = {
    members: filteredMembers,
    currentUserId: userId,
    canManageAccess,
    canManageVisibility,
    isChildWorkspace: workspace.isChild ?? false,
    showWorkspaceColumn: data.isFamilyView === true && workspaceFilter === "all",
    disabled: isBusy,
    onRequestRemoval: handleRequestRemoval,
    onManageAccess: handleManageAccess,
    onTransferOwnership: workspace.isChild ? undefined : () => setTransferPreAlertOpen(true),
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Members</h3>
          <p className="text-muted-foreground text-sm">
            {canManageAccess
              ? "Manage your team members and their permissions."
              : canManage
                ? "Manage invitations and view workspace members."
                : "View workspace members and their roles."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 max-sm:w-full">
          {data.isFamilyView && data.familyWorkspaces && data.familyWorkspaces.length > 1 ? (
            <Select value={workspaceFilter} onValueChange={setWorkspaceFilter}>
              <SelectTrigger className="w-[200px] max-sm:w-full">
                <SelectValue placeholder="All workspaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workspaces</SelectItem>
                {data.familyWorkspaces.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.isChild ? item.name : `${item.name} (parent)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <MembersViewToggle
            value={viewMode}
            onValueChange={setViewMode}
            disabled={isRefetching}
            className="max-sm:flex-1"
          />
          {canManage &&
            (isRefetching ? (
              <Skeleton className={cn("h-9 w-[132px] shrink-0 rounded-md", "max-sm:w-full")} />
            ) : (
              <Button type="button" className="max-sm:w-full" onClick={() => setInviteOpen(true)}>
                <PlusIcon className="size-4" data-icon="inline-start" />
                Invite Member
              </Button>
            ))}
        </div>
      </div>

      {isRefetching ? (
        viewMode === "grid" ? (
          <TeamMembersGridSkeleton count={skeletonCount} />
        ) : (
          <TeamMembersListSkeleton count={skeletonCount} />
        )
      ) : viewMode === "grid" ? (
        <TeamMembersGrid {...memberListProps} />
      ) : (
        <TeamMembersList {...memberListProps} />
      )}

      {canManage && data.pendingInvites.length > 0 && (
        <div className="mt-10">
          <h3 className="font-medium">Pending invitations</h3>
          <div className="mt-6">
            {data.pendingInvites.map((invite, index) => (
              <React.Fragment key={invite.id}>
                <TeamMemberRow
                  variant="pending"
                  name={invite.name}
                  email={invite.email}
                  userId={invite.id}
                  roleLabel={invite.roleLabel}
                  isRegistered={invite.isRegistered}
                  avatarUrl={invite.avatarUrl}
                  currentUserId={userId}
                  canManage={canManage}
                  disabled={isBusy}
                  onRevoke={() => void revokePendingInvite(invite.id)}
                  onViewInviteDetails={() => setDetailsInvite(invite)}
                />
                {index < data.pendingInvites.length - 1 && <Separator className="my-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {canManage && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          workspaceId={data.workspaceId}
          workspaceSlug={workspaceSlug}
          assignableRoles={data.assignableRoles}
          onSuccess={() => router.refresh()}
        />
      )}

      <PendingInviteDetailsDialog
        invite={detailsInvite}
        open={detailsInvite !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsInvite(null);
        }}
      />

      <MemberRemovalDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
        mode={pendingRemoval?.mode ?? "remove"}
        memberName={pendingRemoval?.member.name ?? ""}
        workspaceName={data.workspaceName}
        confirmLoading={isBusy}
        onConfirm={() => void handleConfirmRemoval()}
      />

      {!workspace.isChild ? (
        <>
          <DestructiveAlertDialog
            open={transferPreAlertOpen}
            onOpenChange={setTransferPreAlertOpen}
            title="Transfer workspace ownership?"
            description={`You are about to start an ownership transfer for ${data.workspaceName}. This process is permanent once finalized.`}
            icon={AlertTriangleIcon}
            iconLayout="centered"
            iconVariant="destructiveCircle"
            headerClassName="items-center"
            descriptionClassName="text-center"
            confirmationCheckbox={{ label: "I understand ownership transfer is a serious action" }}
            confirmLabel="Continue"
            onConfirm={() => {
              setTransferPreAlertOpen(false);
              setTransferWizardOpen(true);
            }}
          />

          <WorkspaceTransferDialog
            open={transferWizardOpen}
            onOpenChange={setTransferWizardOpen}
            workspaceId={data.workspaceId}
            workspaceSlug={workspaceSlug}
            workspaceName={data.workspaceName}
            members={data.members}
            currentUserId={userId}
            pendingTransfer={initialPendingTransfer}
            onTransferChanged={handleTransferChanged}
          />
        </>
      ) : null}

      <MemberPermissionsDialog
        open={permissionsMember !== null}
        member={permissionsMember}
        currentUserId={userId}
        workspaceId={permissionsMember?.workspaceId ?? data.workspaceId}
        workspaceSlug={workspaceSlug}
        isChildWorkspace={workspace.isChild ?? false}
        canManageVisibility={canManageVisibility}
        canManageAccess={canManageAccess}
        onOpenChange={(open) => {
          if (!open) setPermissionsMemberId(null);
        }}
        onSaved={(result) => {
          if (permissionsMember) {
            handleMemberAccessSaved(permissionsMember.membershipId, result);
          }
        }}
        onVisibilitySaved={() => router.refresh()}
      />
    </>
  );
}
