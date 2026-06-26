"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ChevronRightIcon,
  FileStack,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LayoutTemplate,
  Settings,
} from "lucide-react";

import { NavUser } from "@/components/dashboard/sidebar/nav-user";
import { useResolvedSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { parseSiteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import type { UserProfile } from "@/types/user";

type AppSiteSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: UserProfile;
};

const PRIMARY_NAV_ITEMS = [
  { title: "Overview", suffix: "/overview", section: "overview", icon: LayoutDashboard },
  { title: "Pages", suffix: "/pages", section: "pages", icon: FileStack },
  { title: "Layout", suffix: "/layout", section: "layout", icon: LayoutTemplate },
  { title: "Blog posts", suffix: "/content", section: "content", icon: FileText },
  { title: "Settings", suffix: "/settings", section: "settings", icon: Settings },
] as const;

export function AppSiteSidebar({ user, className, ...props }: AppSiteSidebarProps) {
  const pathname = usePathname();
  const siteDashboard = useResolvedSiteDashboard();
  const { activeWorkspace } = useWorkspace();

  const parsed = parseSiteDashboardPath(pathname);
  const section = parsed?.section ?? "overview";
  const filesActive = section === "files";

  const workspaceHome = activeWorkspace
    ? workspacePathFromSummary(activeWorkspace, "")
    : "/dashboard";

  const navItems = useMemo(() => PRIMARY_NAV_ITEMS, []);

  if (!siteDashboard) {
    return null;
  }

  const { activeSite, siteDashboardBase } = siteDashboard;
  const filesHref = `${siteDashboardBase}/files`;

  return (
    <Sidebar collapsible="icon" className={className} {...props}>
      <SidebarHeader className="h-(--header-height) justify-center gap-0 px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to workspace">
              <Link href={workspaceHome}>
                <ArrowLeft className="size-4" />
                <span>Workspace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{activeSite.name}</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.section;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={`${siteDashboardBase}${item.suffix}`}>
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            <Collapsible asChild defaultOpen={filesActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="File manager">
                    <FolderOpen className="size-4" />
                    <span>File manager</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={filesActive}>
                        <Link href={filesHref}>
                          <span>Files</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser initialUser={user} workspaceSlug={activeWorkspace?.slug} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
