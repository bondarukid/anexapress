import { Bell, FileText, Plus, Search, Settings, Users } from "lucide-react";

import type { TopDrawerProps } from "@/components/drawers/types";

export const topPresets = {
  simple: {
    title: "Top Drawer",
    description: "A simple top panel.",
    bodyText: "Quick access content from the top.",
  },
  searchBar: {
    title: "Search",
    searchPlaceholder: "Search anything...",
    searchResults: ["Dashboard", "Settings", "Team members", "Reports"],
  },
  notificationBanner: {
    bannerTitle: "System update",
    bannerMessage: "A new version is available. Update now for the latest features.",
  },
  quickActions: {
    title: "Quick actions",
    quickActions: [
      { id: "new", label: "New", icon: Plus },
      { id: "search", label: "Search", icon: Search },
      { id: "team", label: "Team", icon: Users },
      { id: "docs", label: "Docs", icon: FileText },
      { id: "settings", label: "Settings", icon: Settings },
      { id: "alerts", label: "Alerts", icon: Bell },
    ],
  },
  commandBar: {
    title: "Command bar",
    commandItems: [
      { id: "home", label: "Go to dashboard", shortcut: "G D" },
      { id: "search", label: "Search", shortcut: "/" },
      { id: "settings", label: "Open settings", shortcut: "G S" },
      { id: "new", label: "Create new", shortcut: "N" },
      { id: "team", label: "View team", shortcut: "G T" },
      { id: "help", label: "Help center", shortcut: "?" },
    ],
  },
} satisfies Record<string, Partial<TopDrawerProps>>;
