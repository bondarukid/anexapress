"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type EditorSettingsSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
};

type EditorSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  sections: EditorSettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
};

/**
 * macOS-style settings dialog: left navigation, right scrollable content.
 */
export function EditorSettingsDialog({
  open,
  onOpenChange,
  title,
  sections,
  activeSection,
  onSectionChange,
  onSave,
  isSaving = false,
}: EditorSettingsDialogProps) {
  const active =
    sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-4 flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-h-none max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Navigate settings sections using the sidebar.
        </DialogDescription>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[220px_1fr]">
          <aside className="bg-muted/40 flex flex-col border-b md:border-r md:border-b-0">
            <div className="border-b px-4 py-3">
              <p className="font-heading text-sm font-medium">{title}</p>
            </div>

            <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col md:overflow-x-visible">
              {sections.map(({ id, label, icon: Icon }) => {
                const isActive = id === active?.id;

                return (
                  <Button
                    key={id}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-9 shrink-0 justify-start gap-2 px-3 text-sm font-normal",
                      isActive && "bg-background text-foreground shadow-sm",
                    )}
                    onClick={() => onSectionChange(id)}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Button>
                );
              })}
            </nav>
          </aside>

          <ScrollArea className="min-h-0 min-w-0">
            <div className="p-6">
              <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
                {active?.label}
              </h2>
              {active?.content}
            </div>
          </ScrollArea>
        </div>

        <footer className="bg-muted/40 flex shrink-0 items-center justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onSave ? (
            <Button type="button" disabled={isSaving} onClick={onSave}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          ) : null}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
