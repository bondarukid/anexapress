"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toasts";

import { createClient } from "@/lib/supabase/client";
import { notificationToastMessage, shouldShowNotificationToast } from "@/lib/notifications/toast";
import { mailNotificationPath } from "@/lib/notifications/mail-link";
import type { NotificationKind, RealtimeNotificationRow } from "@/types/notification";

type WorkspaceInviteRow = {
  email: string;
  status: string;
};

type UseNotificationRealtimeOptions = {
  userId: string;
  userEmail: string;
  workspaceSlug: string | null;
  onInsert?: (row: RealtimeNotificationRow) => void;
  onDelete?: (row: RealtimeNotificationRow) => void;
  onUpdate?: (row: RealtimeNotificationRow, prev: RealtimeNotificationRow) => void;
  /** Fired when a pending invite row is created for this user's email. */
  onInviteInserted?: () => void;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function useNotificationRealtime({
  userId,
  userEmail,
  workspaceSlug,
  onInsert,
  onDelete,
  onUpdate,
  onInviteInserted,
}: UseNotificationRealtimeOptions) {
  const router = useRouter();

  const handleInsert = React.useEffectEvent((row: RealtimeNotificationRow) => {
    onInsert?.(row);
  });
  const handleDelete = React.useEffectEvent((row: RealtimeNotificationRow) => {
    onDelete?.(row);
  });
  const handleUpdate = React.useEffectEvent(
    (row: RealtimeNotificationRow, prev: RealtimeNotificationRow) => {
      onUpdate?.(row, prev);
    },
  );
  const handleInviteInserted = React.useEffectEvent(() => {
    onInviteInserted?.();
  });

  const normalizedEmail = normalizeEmail(userEmail);

  React.useEffect(() => {
    if (!userId || !normalizedEmail) return;

    const supabase = createClient();
    let notificationsChannel: ReturnType<typeof supabase.channel> | null = null;
    let invitesChannel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const showToast = (row: RealtimeNotificationRow) => {
      if (!shouldShowNotificationToast(row.kind)) return;

      const kind = row.kind as NotificationKind;
      const { title, description } = notificationToastMessage(kind, row.title, row.body);

      const mailHref = workspaceSlug ? mailNotificationPath(workspaceSlug, row.id) : null;

      if (mailHref) {
        toast.interactive.withAction(title, {
          description,
          duration: 8000,
          action: {
            label: "Open",
            onClick: () => {
              router.push(mailHref);
            },
          },
        });
        return;
      }

      toast.content.withDescription(title, description ?? "", { duration: 8000 });
    };

    const handleNotificationInsert = (row: RealtimeNotificationRow) => {
      if (row.read_at) return;
      handleInsert(row);
      showToast(row);
    };

    async function subscribe() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || cancelled) return;

      notificationsChannel = supabase
        .channel(`user_notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            handleNotificationInsert(payload.new as RealtimeNotificationRow);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "user_notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            handleDelete(payload.old as RealtimeNotificationRow);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            handleUpdate(
              payload.new as RealtimeNotificationRow,
              payload.old as RealtimeNotificationRow,
            );
          },
        )
        .subscribe();

      invitesChannel = supabase
        .channel(`workspace_invites:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "workspace_invites",
          },
          (payload) => {
            const row = payload.new as WorkspaceInviteRow;
            if (row.status !== "pending") return;
            if (normalizeEmail(row.email) !== normalizedEmail) return;
            handleInviteInserted();
          },
        )
        .subscribe();
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (notificationsChannel) {
        void supabase.removeChannel(notificationsChannel);
      }
      if (invitesChannel) {
        void supabase.removeChannel(invitesChannel);
      }
    };
  }, [userId, normalizedEmail, workspaceSlug, router]);
}
