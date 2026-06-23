"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { findNotificationIdFromUrl, NOTIFICATION_QUERY_KEY } from "@/lib/notifications/mail-link";
import type { NotificationItem } from "@/types/notification";

import { useMail } from "@/lib/use-mail";

type NotificationUrlSelectionProps = {
  notifications: NotificationItem[];
};

/** Select notification from `?n=` and clear the query param. */
export function NotificationUrlSelection({ notifications }: NotificationUrlSelectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, setMail] = useMail();

  const targetFromUrl = searchParams.get(NOTIFICATION_QUERY_KEY);
  const handledTargetRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!targetFromUrl || notifications.length === 0) return;
    if (handledTargetRef.current === targetFromUrl) return;

    const resolvedId = findNotificationIdFromUrl(notifications, targetFromUrl);
    if (!resolvedId) return;

    handledTargetRef.current = targetFromUrl;
    setMail({ selected: resolvedId });

    const params = new URLSearchParams(searchParams.toString());
    params.delete(NOTIFICATION_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [targetFromUrl, notifications, pathname, router, searchParams, setMail]);

  return null;
}
