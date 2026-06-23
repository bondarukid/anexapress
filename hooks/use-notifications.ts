"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { acceptWorkspaceInviteAction } from "@/actions/notifications/accept-invite";
import { confirmParentAttachRecipientAction } from "@/actions/workspace/confirm-parent-attach-recipient";
import { cancelParentAttachAction } from "@/actions/workspace/cancel-parent-attach";
import { cancelWorkspaceTransferAction } from "@/actions/team/cancel-workspace-transfer";
import { confirmWorkspaceTransferAction } from "@/actions/team/confirm-workspace-transfer";
import { declineWorkspaceInviteAction } from "@/actions/notifications/decline-invite";
import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { fetchNotificationsAction } from "@/actions/notifications/fetch-notifications";
import { markNotificationReadAction } from "@/actions/notifications/mark-notification-read";
import { useNotificationsContextOptional } from "@/components/providers/notifications-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { mapRealtimeRowToNotification } from "@/lib/notifications/map-realtime-row";
import { workspacePath } from "@/lib/routing/workspace-paths";
import {
  isTransferLikeNotification,
  isWorkspaceInviteNotification,
  isWorkspaceParentAttachNotification,
  isWorkspaceTransferNotification,
  type NotificationItem,
} from "@/types/notification";

type UseNotificationsOptions = {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
};

export function useNotifications({
  initialNotifications,
  initialUnreadCount,
}: UseNotificationsOptions) {
  const router = useRouter();
  const toast = useToast();
  const { addWorkspace, refreshWorkspaces } = useWorkspace();
  const notificationsCtx = useNotificationsContextOptional();

  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [prevInitialNotifications, setPrevInitialNotifications] =
    React.useState(initialNotifications);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const unreadCount = notificationsCtx?.unreadCount ?? initialUnreadCount;
  const setUnreadCount = notificationsCtx?.setUnreadCount;

  // Re-sync the list when the server snapshot changes (e.g. after router.refresh()).
  // The unread count is owned and re-synced by NotificationsProvider.
  if (initialNotifications !== prevInitialNotifications) {
    setPrevInitialNotifications(initialNotifications);
    setNotifications(initialNotifications);
  }

  const applySnapshot = React.useCallback(
    (items: NotificationItem[], count: number) => {
      setNotifications(items);
      setUnreadCount?.(count);
    },
    [setUnreadCount],
  );

  const refetchFromServer = React.useCallback(async () => {
    const result = await fetchNotificationsAction();
    if (result.success) {
      applySnapshot(result.notifications, result.unreadCount);
    }
  }, [applySnapshot]);

  React.useEffect(() => {
    if (!notificationsCtx?.subscribeNotificationsChange) return;

    return notificationsCtx.subscribeNotificationsChange((event) => {
      if (event.type === "insert" && event.row) {
        const item = mapRealtimeRowToNotification(event.row);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === item.id)) return prev;
          return [item, ...prev];
        });
      }

      if (event.type === "delete" && event.row) {
        setNotifications((prev) => prev.filter((n) => n.id !== event.row!.id));
      }

      void refetchFromServer();
    });
  }, [notificationsCtx, refetchFromServer]);

  const removeFromList = React.useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.read) {
          setUnreadCount?.((c) => Math.max(0, c - 1));
        }
        return next;
      });
    },
    [setUnreadCount],
  );

  const markReadLocally = React.useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (!target || target.read) return prev;
        return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      });
      setUnreadCount?.((c) => Math.max(0, c - 1));
    },
    [setUnreadCount],
  );

  const markNotificationRead = React.useCallback(
    async (item: NotificationItem) => {
      if (item.read) return;
      markReadLocally(item.id);
      await markNotificationReadAction(item.id);
    },
    [markReadLocally],
  );

  const selectNotification = React.useCallback(
    (item: NotificationItem) => {
      void markNotificationRead(item);
    },
    [markNotificationRead],
  );

  const deleteNotification = React.useCallback(
    async (id: string) => {
      setPendingId(id);
      try {
        const result = await deleteNotificationAction(id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        removeFromList(id);
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, removeFromList, router],
  );

  const acceptInvite = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.inviteId) return;
      setPendingId(item.id);
      try {
        const result = await acceptWorkspaceInviteAction(item.inviteId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }

        const ws = result.data!;
        addWorkspace({
          id: ws.workspaceId,
          name: ws.workspaceName,
          slug: ws.workspaceSlug,
          logoUrl: ws.logoUrl,
          websiteUrl: null,
          timezone: ws.timezone,
          roleSlug: ws.roleSlug,
        });
        removeFromList(item.id);
        toast.success(`You joined ${ws.workspaceName}`);
        refreshWorkspaces();
        router.push(workspacePath(ws.workspaceSlug));
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [addWorkspace, toast, refreshWorkspaces, removeFromList, router],
  );

  const declineInvite = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.inviteId) return;
      setPendingId(item.id);
      try {
        const result = await declineWorkspaceInviteAction(item.inviteId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        removeFromList(item.id);
        toast.info("Invitation declined");
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, removeFromList, router],
  );

  const acceptTransfer = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.transferId) return;
      setPendingId(item.id);
      try {
        const result = await confirmWorkspaceTransferAction({
          transferId: item.transferId,
          workspaceSlug: item.workspaceSlug ?? undefined,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        removeFromList(item.id);
        toast.success("Transfer accepted. Waiting for the owner to finalize.");
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, removeFromList, router],
  );

  const declineTransfer = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.transferId) return;
      setPendingId(item.id);
      try {
        const result = await cancelWorkspaceTransferAction({
          transferId: item.transferId,
          workspaceSlug: item.workspaceSlug ?? undefined,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        removeFromList(item.id);
        toast.info("Transfer declined");
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, removeFromList, router],
  );

  const acceptParentAttach = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.transferId) return;
      setPendingId(item.id);
      try {
        const result = await confirmParentAttachRecipientAction({
          transferId: item.transferId,
          parentSlug: item.parentWorkspaceSlug ?? item.workspaceSlug ?? undefined,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        removeFromList(item.id);
        toast.success("Attach accepted. Waiting for the initiator to finalize.");
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, removeFromList, router],
  );

  const declineParentAttach = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.transferId) return;
      setPendingId(item.id);
      try {
        const result = await cancelParentAttachAction({
          transferId: item.transferId,
          parentSlug: item.parentWorkspaceSlug ?? item.workspaceSlug ?? undefined,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        removeFromList(item.id);
        toast.info("Attach request declined");
        router.refresh();
      } finally {
        setPendingId(null);
      }
    },
    [toast, removeFromList, router],
  );

  const acceptNotification = React.useCallback(
    async (item: NotificationItem) => {
      if (isWorkspaceParentAttachNotification(item.kind) && item.transferRole === "recipient") {
        await acceptParentAttach(item);
        return;
      }
      if (isWorkspaceTransferNotification(item.kind) && item.transferRole === "recipient") {
        await acceptTransfer(item);
        return;
      }
      if (isWorkspaceInviteNotification(item.kind)) {
        await acceptInvite(item);
      }
    },
    [acceptInvite, acceptParentAttach, acceptTransfer],
  );

  const declineNotification = React.useCallback(
    async (item: NotificationItem) => {
      if (isTransferLikeNotification(item.kind) && item.transferRole === "recipient") {
        if (isWorkspaceParentAttachNotification(item.kind)) {
          await declineParentAttach(item);
        } else {
          await declineTransfer(item);
        }
        return;
      }
      if (isWorkspaceInviteNotification(item.kind)) {
        await declineInvite(item);
      }
    },
    [declineInvite, declineParentAttach, declineTransfer],
  );

  return {
    notifications,
    unreadCount,
    pendingId,
    selectNotification,
    markNotificationRead,
    deleteNotification,
    acceptInvite,
    declineInvite,
    acceptTransfer,
    declineTransfer,
    acceptNotification,
    declineNotification,
  };
}
