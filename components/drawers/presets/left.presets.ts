import {
  FileText,
  FolderOpen,
  Home,
  Settings,
  Users,
} from "lucide-react";

import type { LeftDrawerProps } from "@/components/drawers/types";

export const leftPresets = {
  simple: {
    title: "Left Drawer",
    description: "A simple left-side panel.",
    bodyText: "Navigation or content can go here.",
  },
  navigationMenu: {
    title: "Navigation",
    navItems: [
      { id: "home", label: "Home", icon: Home, href: "#" },
      { id: "inventory", label: "Inventory", icon: FolderOpen, href: "#" },
      { id: "team", label: "Team", icon: Users, href: "#" },
      { id: "docs", label: "Documents", icon: FileText, href: "#" },
      { id: "settings", label: "Settings", icon: Settings, href: "#" },
    ],
  },
  nestedItems: {
    title: "Menu",
    nestedNavGroups: [
      {
        id: "workspace",
        label: "Workspace",
        icon: FolderOpen,
        items: [
          { id: "overview", label: "Overview", href: "#" },
          { id: "reports", label: "Reports", href: "#" },
        ],
      },
      {
        id: "account",
        label: "Account",
        icon: Users,
        items: [
          { id: "profile", label: "Profile", href: "#" },
          { id: "billing", label: "Billing", href: "#" },
        ],
      },
    ],
  },
  withSearch: {
    title: "Search menu",
    searchPlaceholder: "Search pages...",
    navItems: [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "reports", label: "Reports", icon: FileText },
      { id: "members", label: "Members", icon: Users },
      { id: "preferences", label: "Preferences", icon: Settings },
    ],
  },
  fileExplorer: {
    title: "Files",
    fileNodes: [
      {
        id: "src",
        name: "src",
        type: "folder",
        children: [
          { id: "index", name: "index.ts", type: "file" },
          { id: "utils", name: "utils.ts", type: "file" },
        ],
      },
      {
        id: "docs",
        name: "docs",
        type: "folder",
        children: [{ id: "readme", name: "README.md", type: "file" }],
      },
    ],
  },
} satisfies Record<string, Partial<LeftDrawerProps>>;
