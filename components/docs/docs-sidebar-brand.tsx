"use client";

import Link from "next/link";

import { LogoIcon } from "@/components/shared/logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SITE_NAME, SITE_VERSION } from "@/lib/constants";
import { getDocsSiteUrl } from "@/lib/docs/host";
import { cn } from "@/lib/utils";

/**
 * Static docs sidebar brand block — mirrors TeamSwitcher layout without a dropdown.
 */
export function DocsSidebarBrand() {
  const docsHome = getDocsSiteUrl();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg">
          <Link href={docsHome}>
            <div
              className={cn(
                "bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg",
              )}
            >
              <LogoIcon className="size-4" uniColor />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{SITE_NAME}</span>
              <span className="text-muted-foreground truncate text-xs">v{SITE_VERSION}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
