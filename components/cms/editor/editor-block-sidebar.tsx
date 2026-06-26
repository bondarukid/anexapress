"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export const EDITOR_BLOCK_OUTLINE_ROOT_ID = "editor-block-outline-root";

type EditorBlockSidebarProps = React.ComponentProps<typeof Sidebar>;

/**
 * Left sidebar for CMS editor: back link + block outline portal target.
 */
export function EditorBlockSidebar({ className, ...props }: EditorBlockSidebarProps) {
  const { chrome } = useEditorChrome();

  return (
    <Sidebar className={className} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-muted-foreground">
              <Link href={chrome.closeHref}>
                <ArrowLeft className="size-4" />
                <span>{chrome.closeLabel}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1">
        <SidebarGroup className="flex min-h-0 flex-1 flex-col">
          <SidebarGroupLabel>Blocks</SidebarGroupLabel>
          <div
            id={EDITOR_BLOCK_OUTLINE_ROOT_ID}
            className="min-h-0 flex-1 overflow-y-auto px-2"
          />
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
