"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { shouldRefreshTeamOnNotification } from "@/lib/team/realtime";

type InviteRow = {
  id: string;
  status: string;
};

type UseWorkspaceTeamRealtimeOptions = {
  workspaceId: string;
  userId: string;
  enabled?: boolean;
  onChange: () => void;
  /** Remove a row from the pending list immediately (before refetch completes). */
  onInviteResolved?: (inviteId: string) => void;
};

function shouldRefreshOnInviteUpdate(next: InviteRow, prev: InviteRow | undefined): boolean {
  if (next.status !== "pending") return true;
  if (prev?.status && prev.status !== next.status) return true;
  return false;
}

/** Refresh team UI when invites or memberships change in the workspace. */
export function useWorkspaceTeamRealtime({
  workspaceId,
  userId,
  enabled = true,
  onChange,
  onInviteResolved,
}: UseWorkspaceTeamRealtimeOptions) {
  const notify = React.useEffectEvent(() => {
    onChange();
  });
  const handleInviteResolved = React.useEffectEvent((inviteId: string) => {
    onInviteResolved?.(inviteId);
  });

  React.useEffect(() => {
    if (!enabled || !workspaceId || !userId) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const handleInviteUpdate = (next: InviteRow, prev: InviteRow | undefined) => {
      if (shouldRefreshOnInviteUpdate(next, prev)) {
        if (next.status !== "pending" && next.id) {
          handleInviteResolved(next.id);
        }
        notify();
      }
    };

    async function subscribe() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || cancelled) return;

      channel = supabase
        .channel(`workspace_team:${workspaceId}:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "workspace_invites",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          (payload) => {
            handleInviteUpdate(payload.new as InviteRow, payload.old as InviteRow | undefined);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "workspace_invites",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          () => notify(),
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "workspace_invites",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          () => notify(),
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "workspace_members",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          () => notify(),
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "workspace_members",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          () => notify(),
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as {
              kind: string;
              invite_id: string | null;
            };
            if (!row.invite_id) return;
            if (shouldRefreshTeamOnNotification(row.kind)) {
              notify();
            }
          },
        )
        .subscribe();
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [workspaceId, userId, enabled]);
}
