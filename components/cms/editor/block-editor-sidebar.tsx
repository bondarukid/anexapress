"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BlockEditorSidebarProps = {
  contentTab: ReactNode;
  seoTab: ReactNode;
  mediaTab: ReactNode;
  versionsTab: ReactNode;
};

export function BlockEditorSidebar({
  contentTab,
  seoTab,
  mediaTab,
  versionsTab,
}: BlockEditorSidebarProps) {
  return (
    <Tabs defaultValue="content">
      <TabsList className="mb-4 w-full">
        <TabsTrigger value="content" className="flex-1">
          Content
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex-1">
          SEO
        </TabsTrigger>
        <TabsTrigger value="media" className="flex-1">
          Media
        </TabsTrigger>
        <TabsTrigger value="versions" className="flex-1">
          Versions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="content">{contentTab}</TabsContent>
      <TabsContent value="seo">{seoTab}</TabsContent>
      <TabsContent value="media">{mediaTab}</TabsContent>
      <TabsContent value="versions">{versionsTab}</TabsContent>
    </Tabs>
  );
}
