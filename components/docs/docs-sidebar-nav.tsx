"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { isDocsNavGroupActive, isDocsUrlActive } from "@/lib/docs/sidebar-nav";
import type { SerializedDocsNavItem } from "@/types/docs-nav";
import { ChevronRightIcon } from "lucide-react";

function DocsNavLeaf({ item }: { item: SerializedDocsNavItem }) {
  const pathname = usePathname();
  if (!item.url) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isDocsUrlActive(item.url, pathname)}
        tooltip={item.title}
      >
        <Link href={item.url}>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function DocsNavGroup({ item }: { item: SerializedDocsNavItem }) {
  const pathname = usePathname();
  const subItems = item.items ?? [];
  if (subItems.length === 0) return null;

  const isActive = isDocsNavGroupActive(subItems, pathname);

  return (
    <Collapsible
      asChild
      defaultOpen={item.defaultOpen ?? isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            <span>{item.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {subItems.map((subItem) => (
              <SidebarMenuSubItem key={`${subItem.title}-${subItem.url ?? "group"}`}>
                {subItem.url ? (
                  <SidebarMenuSubButton
                    asChild
                    isActive={isDocsUrlActive(subItem.url, pathname)}
                  >
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                ) : null}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function DocsSidebarNav({ items }: { items: SerializedDocsNavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Documentation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            <DocsNavGroup key={item.title} item={item} />
          ) : (
            <DocsNavLeaf key={item.title} item={item} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
