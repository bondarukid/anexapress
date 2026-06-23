"use client";

import type { ReactNode } from "react";
import { FileText, History, ImageIcon, Search } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EditorSidebarTab = "content" | "seo" | "media" | "versions";

type BlockEditorSidebarProps = {
  contentTab: ReactNode;
  seoTab: ReactNode;
  mediaTab: ReactNode;
  versionsTab: ReactNode;
  activeTab: EditorSidebarTab;
  onTabChange: (tab: EditorSidebarTab) => void;
};

const TAB_ITEMS: { value: EditorSidebarTab; label: string; icon: typeof FileText }[] = [
  { value: "content", label: "Content", icon: FileText },
  { value: "seo", label: "SEO", icon: Search },
  { value: "media", label: "Media", icon: ImageIcon },
  { value: "versions", label: "Versions", icon: History },
];

/**
 * Inspector sidebar with scrollable tab panels.
 */
export function BlockEditorSidebar({
  contentTab,
  seoTab,
  mediaTab,
  versionsTab,
  activeTab,
  onTabChange,
}: BlockEditorSidebarProps) {
  const panels: Record<EditorSidebarTab, ReactNode> = {
    content: contentTab,
    seo: seoTab,
    media: mediaTab,
    versions: versionsTab,
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as EditorSidebarTab)}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="shrink-0 px-3 pt-3">
        <TabsList variant="line" className="h-auto w-full justify-start gap-0 p-0">
          {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 gap-1.5 rounded-none px-2 py-2 text-xs after:bottom-0"
            >
              <Icon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {TAB_ITEMS.map(({ value }) => (
          <TabsContent key={value} value={value} className="m-0 outline-none">
            {panels[value]}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

export type { EditorSidebarTab };
