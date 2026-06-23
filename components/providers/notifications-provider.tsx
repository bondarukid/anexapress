"use client";

import * as React from "react";

import { fetchNotificationsAction } from "@/actions/notifications/fetch-notifications";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import type { RealtimeNotificationRow } from "@/types/notification";
import { useWorkspace } from "@/components/providers/workspace-provider";

export type NotificationChangeEvent = {
  type: "insert" | "delete" | "update" | "invite";
  row?: RealtimeNotificationRow;
};

type NotificationsContextValue = {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  bumpUnread: () => void;
  subscribeNotificationsChange: (listener: (event: NotificationChangeEvent) => void) => () => void;
  refetchNotifications: () => Promise<void>;
};

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotificationsContext must be used within NotificationsProvider");
  }
  return ctx;
}

export function useNotificationsContextOptional(): NotificationsContextValue | null {
  return React.useContext(NotificationsContext);
}

type NotificationsProviderProps = {
  userId: string;
  userEmail: string;
  initialUnreadCount: number;
  children: React.ReactNode;
};

export function NotificationsProvider({
  userId,
  userEmail,
  initialUnreadCount,
  children,
}: NotificationsProviderProps) {
  const { activeWorkspace } = useWorkspace();
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const [prevInitialUnreadCount, setPrevInitialUnreadCount] = React.useState(initialUnreadCount);
  const changeListenersRef = React.useRef(new Set<(event: NotificationChangeEvent) => void>());

  // Re-sync from the server snapshot when it changes (after router.refresh()).
  if (initialUnreadCount !== prevInitialUnreadCount) {
    setPrevInitialUnreadCount(initialUnreadCount);
    setUnreadCount(initialUnreadCount);
  }

  const emitChange = React.useCallback((event: NotificationChangeEvent) => {
    changeListenersRef.current.forEach((listener) => listener(event));
  }, []);

  const subscribeNotificationsChange = React.useCallback(
    (listener: (event: NotificationChangeEvent) => void) => {
      changeListenersRef.current.add(listener);
      return () => {
        changeListenersRef.current.delete(listener);
      };
    },
    [],
  );

  const refetchNotifications = React.useCallback(async () => {
    const result = await fetchNotificationsAction();
    if (result.success) {
      setUnreadCount(result.unreadCount);
    }
    emitChange({ type: "invite" });
  }, [emitChange]);

  const handleInsert = React.useCallback(
    (row: RealtimeNotificationRow) => {
      setUnreadCount((c) => c + 1);
      emitChange({ type: "insert", row });
    },
    [emitChange],
  );

  const handleDelete = React.useCallback(
    (row: RealtimeNotificationRow) => {
      if (!row.read_at) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      emitChange({ type: "delete", row });
    },
    [emitChange],
  );

  const handleUpdate = React.useCallback(
    (row: RealtimeNotificationRow, prev: RealtimeNotificationRow) => {
      if (!prev.read_at && row.read_at) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      emitChange({ type: "update", row });
    },
    [emitChange],
  );

  const handleInviteInserted = React.useCallback(() => {
    void refetchNotifications();
  }, [refetchNotifications]);

  useNotificationRealtime({
    userId,
    userEmail,
    workspaceSlug: activeWorkspace?.slug ?? null,
    onInsert: handleInsert,
    onDelete: handleDelete,
    onUpdate: handleUpdate,
    onInviteInserted: handleInviteInserted,
  });

  const value = React.useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      bumpUnread: () => setUnreadCount((c) => c + 1),
      subscribeNotificationsChange,
      refetchNotifications,
    }),
    [unreadCount, subscribeNotificationsChange, refetchNotifications],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
