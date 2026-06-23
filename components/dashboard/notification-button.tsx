import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationButtonProps {
  hasNotifications: boolean;
  href?: string | null;
  onClick?: () => void;
}

export function NotificationButton({ hasNotifications, href, onClick }: NotificationButtonProps) {
  const content = (
    <>
      <Bell className="h-5 w-5" />
      {hasNotifications ? (
        <Badge className="border-background bg-destructive pointer-events-none absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 p-0" />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Button asChild variant="ghost" size="icon" className="relative">
        <Link href={href} aria-label="Notifications" onClick={onClick}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
      aria-label="Notifications"
    >
      {content}
    </Button>
  );
}
