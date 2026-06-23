import { Suspense } from "react";
import { redirect } from "next/navigation";

import { NotificationsCenter } from "@/components/dashboard/mail/notifications-center";
import { getCurrentUser } from "@/services/user";
import { getNotificationsForUser, getUnreadNotificationCount } from "@/services/notifications";

/**
 * Notifications center at `/{workspaceSlug}/dashboard/mail`.
 */
export default async function MailPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotificationsForUser(user.id, user.email),
    getUnreadNotificationCount(user.id, user.email),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Loading notifications…
          </div>
        }
      >
        <NotificationsCenter
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
        />
      </Suspense>
    </div>
  );
}
