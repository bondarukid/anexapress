"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { fetchTeamPageAction } from "@/actions/team/fetch-team-page";
import { createEmailInviteAction } from "@/actions/invite/create-email-invite";
import { leaveWorkspaceAction } from "@/actions/team/leave-workspace";
import { removeTeamMemberAction } from "@/actions/team/remove-member";
import { revokeTeamInviteAction } from "@/actions/team/revoke-invite";
import type { InvitePayload } from "@/lib/team/types";
import { useNotificationsContextOptional } from "@/components/providers/notifications-provider";
import { useWorkspaceTeamRealtime } from "@/hooks/use-workspace-team-realtime";
import { shouldRefreshTeamOnNotification } from "@/lib/team/realtime";
import type { TeamPageData, UpdateMemberAccessResult } from "@/types/team";

type UseTeamManagementOptions = {
  initialData: TeamPageData;
  workspaceSlug: string;
  userId: string;
};

export function useTeamManagement({
  initialData,
  workspaceSlug,
  userId,
}: UseTeamManagementOptions) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = React.useState(initialData);
  const [prevInitialData, setPrevInitialData] = React.useState(initialData);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [isRefetching, setIsRefetching] = React.useState(false);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setData(initialData);
  }

  const workspaceId = data.workspaceId;

  const refetchTeam = React.useCallback(async () => {
    setIsRefetching(true);
    try {
      const result = await fetchTeamPageAction(workspaceId);
      if (result.success && result.data) {
        setData(result.data);
      }
    } finally {
      setIsRefetching(false);
    }
  }, [workspaceId]);

  const refreshTeamFromRemote = React.useCallback(() => {
    void refetchTeam();
  }, [refetchTeam]);

  const removePendingInvite = React.useCallback((inviteId: string) => {
    setData((prev) => ({
      ...prev,
      pendingInvites: prev.pendingInvites.filter((i) => i.id !== inviteId),
    }));
  }, []);

  useWorkspaceTeamRealtime({
    workspaceId,
    userId,
    onChange: refreshTeamFromRemote,
    onInviteResolved: removePendingInvite,
  });

  const notificationsCtx = useNotificationsContextOptional();

  React.useEffect(() => {
    if (!notificationsCtx) return;

    return notificationsCtx.subscribeNotificationsChange((event) => {
      if (
        event.type !== "insert" ||
        !event.row?.invite_id ||
        !shouldRefreshTeamOnNotification(event.row.kind)
      ) {
        return;
      }
      removePendingInvite(event.row.invite_id);
      void refetchTeam();
    });
  }, [notificationsCtx, refetchTeam, removePendingInvite]);

  const inviteMember = React.useCallback(
    async ({ email, roleId }: InvitePayload) => {
      setPendingId("invite");
      try {
        const result = await createEmailInviteAction({
          workspaceId,
          email,
          roleId,
          workspaceSlug,
        });
        if (!result.success) {
          toast.error(result.error);
          return false;
        }
        toast.success("Invitation sent");
        router.refresh();
        return true;
      } finally {
        setPendingId(null);
      }
    },
    [toast, router, workspaceId, workspaceSlug],
  );

  const removeActiveMember = React.useCallback(
    async (membershipId: string): Promise<boolean> => {
      setPendingId(membershipId);
      try {
        const result = await removeTeamMemberAction({
          workspaceId,
          membershipId,
          workspaceSlug,
        });
        if (!result.success) {
          toast.error(result.error);
          return false;
        }
        setData((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.membershipId !== membershipId),
        }));
        toast.success("Member removed");
        router.refresh();
        return true;
      } finally {
        setPendingId(null);
      }
    },
    [toast, router, workspaceId, workspaceSlug],
  );

  const leaveWorkspace = React.useCallback(async (): Promise<boolean> => {
    setPendingId("leave");
    try {
      const result = await leaveWorkspaceAction({ workspaceId, workspaceSlug });
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      toast.success("You left the workspace");
      router.push("/dashboard");
      router.refresh();
      return true;
    } finally {
      setPendingId(null);
    }
  }, [toast, router, workspaceId, workspaceSlug]);

  const revokePendingInvite = React.useCallback(
    async (inviteId: string) => {
      setPendingId(inviteId);
      try {
        const result = await revokeTeamInviteAction({
          workspaceId,
          inviteId,
          workspaceSlug,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setData((prev) => ({
          ...prev,
          pendingInvites: prev.pendingInvites.filter((i) => i.id !== inviteId),
        }));
        toast.success("Invitation withdrawn");
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, router, workspaceId, workspaceSlug],
  );

  const applyMemberAccessUpdate = React.useCallback(
    (membershipId: string, result: UpdateMemberAccessResult) => {
      setData((prev) => ({
        ...prev,
        members: prev.members.map((member) => {
          if (member.membershipId !== membershipId) return member;
          return {
            ...member,
            roleId: result.roleId,
            roleSlug: result.roleSlug,
            roleLabel: result.roleLabel,
            usesCustomPermissions: result.usesCustomPermissions,
          };
        }),
      }));
      router.refresh();
    },
    [router],
  );

  return {
    data,
    pendingId,
    isRefetching,
    inviteMember,
    removeActiveMember,
    leaveWorkspace,
    revokePendingInvite,
    applyMemberAccessUpdate,
    refetchTeam,
  };
}
