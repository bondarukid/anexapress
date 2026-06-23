"use client";

import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NotificationItem } from "@/types/notification";

import { useMail } from "@/lib/use-mail";

type MailListProps = {
  items: NotificationItem[];
  onSelect?: (item: NotificationItem) => void;
};

export function MailList({ items, onSelect }: MailListProps) {
  const [mail, setMail] = useMail();

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center p-8 text-center text-sm">
        No notifications
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
              mail.selected === item.id && "bg-muted",
            )}
            onClick={() => {
              setMail({ selected: item.id });
              onSelect?.(item);
            }}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.title}</div>
                  {!item.read && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              {item.kind === "workspace_invite" ? (
                <Badge variant="secondary" className="w-fit text-xs">
                  Invitation
                </Badge>
              ) : item.kind === "workspace_transfer" ? (
                <Badge variant="secondary" className="w-fit text-xs">
                  Transfer
                </Badge>
              ) : item.kind === "workspace_parent_attach" ? (
                <Badge variant="secondary" className="w-fit text-xs">
                  Parent attach
                </Badge>
              ) : (
                <Badge variant="outline" className="w-fit text-xs">
                  System
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground line-clamp-2 text-xs">
              {item.kind === "workspace_invite" && item.workspaceName
                ? `Join ${item.workspaceName}`
                : item.kind === "workspace_transfer" && item.workspaceName
                  ? `Ownership transfer for ${item.workspaceName}`
                  : item.kind === "workspace_parent_attach" && item.workspaceName
                    ? `Attach ${item.workspaceName} under parent`
                    : item.body}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
