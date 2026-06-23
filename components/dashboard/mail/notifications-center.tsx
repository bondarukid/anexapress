"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { NotificationItem } from "@/types/notification";

import { findNotificationIdFromUrl, NOTIFICATION_QUERY_KEY } from "@/lib/notifications/mail-link";
import { getFieldLabelId } from "@/lib/ui/field-a11y";

import { MailProvider, useMail } from "@/lib/use-mail";
import { AutoMarkNotificationRead } from "./auto-mark-notification-read";
import { MailDisplay } from "./mail-display";
import { MailList } from "./mail-list";
import { NotificationUrlSelection } from "./notification-url-selection";

const LIST_PANEL_ID = "notifications-list";
const DISPLAY_PANEL_ID = "notifications-display";

type NotificationsCenterProps = {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
};

export function NotificationsCenter({
  initialNotifications,
  initialUnreadCount,
}: NotificationsCenterProps) {
  const searchParams = useSearchParams();
  const targetFromUrl = searchParams.get(NOTIFICATION_QUERY_KEY);

  const notificationState = useNotifications({
    initialNotifications,
    initialUnreadCount,
  });

  const initialSelected =
    (targetFromUrl
      ? findNotificationIdFromUrl(notificationState.notifications, targetFromUrl)
      : null) ??
    notificationState.notifications[0]?.id ??
    null;

  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("all");

  const filtered = React.useMemo(() => {
    let items = notificationState.notifications;
    if (tab === "unread") {
      items = items.filter((n) => !n.read);
    }
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    );
  }, [notificationState.notifications, search, tab]);

  return (
    <MailProvider initialSelected={initialSelected}>
      <NotificationUrlSelection notifications={notificationState.notifications} />
      <AutoMarkNotificationRead
        notifications={notificationState.notifications}
        onMarkRead={notificationState.markNotificationRead}
      />
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full min-h-0 items-stretch"
          style={{ height: "calc(100vh - var(--header-height))" }}
        >
          <ResizablePanel id={LIST_PANEL_ID} defaultSize="38" minSize="30" maxSize="45">
            <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col gap-0">
              <div className="flex h-[52px] items-center gap-2 px-4 py-2">
                <Bell className="h-5 w-5" />
                <h1 className="text-xl font-bold">Notifications</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {notificationState.unreadCount > 0 ? (
                      <span className="text-muted-foreground ml-1.5 text-xs">
                        ({notificationState.unreadCount})
                      </span>
                    ) : null}
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator />
              <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur">
                <Field className="relative">
                  <FieldLabel
                    htmlFor="notifications-search"
                    id={getFieldLabelId("notifications-search")}
                    className="sr-only"
                  >
                    Search notifications
                  </FieldLabel>
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input
                    id="notifications-search"
                    placeholder="Search notifications"
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Field>
              </div>
              <TabsContent value="all" className="m-0 min-h-0 flex-1 overflow-hidden">
                <MailList items={filtered} onSelect={notificationState.selectNotification} />
              </TabsContent>
              <TabsContent value="unread" className="m-0 min-h-0 flex-1 overflow-hidden">
                <MailList items={filtered} onSelect={notificationState.selectNotification} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id={DISPLAY_PANEL_ID} defaultSize="62" minSize="40">
            <SelectedNotificationDisplay
              notifications={notificationState.notifications}
              pendingId={notificationState.pendingId}
              onDelete={notificationState.deleteNotification}
              onAccept={notificationState.acceptNotification}
              onDecline={notificationState.declineNotification}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </MailProvider>
  );
}

type SelectedNotificationDisplayProps = {
  notifications: NotificationItem[];
  pendingId: string | null;
  onDelete: (id: string) => Promise<void>;
  onAccept: (item: NotificationItem) => Promise<void>;
  onDecline: (item: NotificationItem) => Promise<void>;
};

function SelectedNotificationDisplay({
  notifications,
  pendingId,
  onDelete,
  onAccept,
  onDecline,
}: SelectedNotificationDisplayProps) {
  const [mail] = useMail();
  const selected = notifications.find((n) => n.id === mail.selected) ?? null;

  return (
    <MailDisplay
      notification={selected}
      isPending={pendingId !== null && pendingId === selected?.id}
      onDelete={() => {
        if (selected) void onDelete(selected.id);
      }}
      onAccept={() => {
        if (selected) void onAccept(selected);
      }}
      onDecline={() => {
        if (selected) void onDecline(selected);
      }}
    />
  );
}
