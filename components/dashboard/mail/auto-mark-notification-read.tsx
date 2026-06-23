"use client";

import * as React from "react";

import type { NotificationItem } from "@/types/notification";

import { useMail } from "@/lib/use-mail";

type AutoMarkNotificationReadProps = {
  notifications: NotificationItem[];
  onMarkRead: (item: NotificationItem) => void;
};

/** Mark the currently selected notification as read (including initial / URL selection). */
export function AutoMarkNotificationRead({
  notifications,
  onMarkRead,
}: AutoMarkNotificationReadProps) {
  const [mail] = useMail();

  const markRead = React.useEffectEvent((item: NotificationItem) => {
    onMarkRead(item);
  });

  React.useEffect(() => {
    if (!mail.selected) return;

    const item = notifications.find((n) => n.id === mail.selected);
    if (!item || item.read) return;

    markRead(item);
  }, [mail.selected, notifications]);

  return null;
}
