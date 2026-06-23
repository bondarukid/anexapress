"use client";

import Link from "next/link";

import { DocsSidebarBrand } from "@/components/docs/docs-sidebar-brand";
import { DocsSidebarNav } from "@/components/docs/docs-sidebar-nav";
import { useDocsShell } from "@/components/docs/docs-shell-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ArrowLeftIcon } from "lucide-react";

import { SITE_NAME } from "@/lib/constants";
import { getSiteUrl } from "@/lib/docs/host";

export function DocsSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { navItems } = useDocsShell();
  const siteUrl = getSiteUrl();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <DocsSidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        <DocsSidebarNav items={navItems} />
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground">
              <Link href={siteUrl}>
                <ArrowLeftIcon />
                <span>Back to {SITE_NAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
