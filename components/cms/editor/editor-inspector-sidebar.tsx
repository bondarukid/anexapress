"use client";

import type { ReactNode } from "react";
import { PanelRightIcon } from "lucide-react";

import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type EditorInspectorSidebarProps = React.ComponentProps<typeof Sidebar> & {
  children?: ReactNode;
};

function EditorInspectorSidebarLabel() {
  const { documentLabel, hasDocumentSettings, selectedBlock } = useEditorInspector();

  if (selectedBlock) {
    return <SidebarGroupLabel>{selectedBlock.label}</SidebarGroupLabel>;
  }

  if (hasDocumentSettings) {
    return <SidebarGroupLabel>{`${documentLabel} settings`}</SidebarGroupLabel>;
  }

  return <SidebarGroupLabel>Inspector</SidebarGroupLabel>;
}

/**
 * Right inspector sidebar for CMS editor — mirrors left block sidebar styling and offcanvas behavior.
 */
export function EditorInspectorSidebar({
  children,
  className,
  ...props
}: EditorInspectorSidebarProps) {
  return (
    <Sidebar
      side="right"
      variant="inset"
      collapsible="offcanvas"
      contained
      className={className}
      {...props}
    >
      <SidebarContent className="min-h-0 flex-1 overflow-hidden">
        {children ? (
          <SidebarGroup className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <EditorInspectorSidebarLabel />
            <div className="min-h-0 flex-1 overflow-y-auto px-2">{children}</div>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

type InspectorSidebarTriggerProps = React.ComponentProps<typeof Button>;

/**
 * Header control for toggling the right inspector without shifting layout.
 */
export function InspectorSidebarTrigger({ className, ...props }: InspectorSidebarTriggerProps) {
  const { inspectorOpen, toggleInspector } = useEditorChrome();

  return (
    <Button
      type="button"
      data-sidebar="trigger"
      data-slot="inspector-sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={toggleInspector}
      aria-label={inspectorOpen ? "Hide inspector" : "Show inspector"}
      aria-pressed={inspectorOpen}
      {...props}
    >
      <PanelRightIcon />
      <span className="sr-only">Toggle inspector</span>
    </Button>
  );
}
