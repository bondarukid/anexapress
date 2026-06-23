"use client";

import Link from "next/link";

import { signOut } from "@/actions/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";
import { workspacePath } from "@/lib/routing/workspace-paths";
import { UserProfile } from "@/types/user";

/**
 * Sidebar footer user menu — personal shortcuts into `/dashboard/settings/{account,billing,...}` only.
 *
 * SaaS scope (`workspace`) stays in `AppSidebar` under “Workspace settings” — not here.
 *
 * Dropdown items use `asChild + Link` for SPA transitions consistent with collapsible submenu links.
 */

/** Two-letter avatar fallback when no image URL is available. */
function initialsFromUser(user: UserProfile): string {
  const firstName = user.firstName?.trim() || "";
  const lastName = user.lastName?.trim() || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "?";
}

interface PersonalInfoProps {
  initialUser: UserProfile;
  workspaceSlug?: string | null;
}

export function NavUser({ initialUser, workspaceSlug }: PersonalInfoProps) {
  const { isMobile } = useSidebar();
  const settingsBase = workspaceSlug ? workspacePath(workspaceSlug, "/settings") : "#";
  const initials = initialsFromUser(initialUser);
  const displayName =
    initialUser.firstName || initialUser.lastName
      ? `${initialUser.firstName || ""} ${initialUser.lastName || ""}`.trim()
      : initialUser.email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {initialUser.avatarUrl ? (
                  <AvatarImage
                    src={initialUser.avatarUrl}
                    alt={displayName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{initialUser.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {initialUser.avatarUrl ? (
                    <AvatarImage
                      src={initialUser.avatarUrl}
                      alt={displayName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{initialUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/pricing">
                  <SparklesIcon />
                  Upgrade / Plans
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={`${settingsBase}/account`}>
                  <BadgeCheckIcon />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${settingsBase}/billing`}>
                  <CreditCardIcon />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${settingsBase}/notifications`}>
                  <BellIcon />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer">
                  <LogOutIcon className="size-4" />
                  Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
