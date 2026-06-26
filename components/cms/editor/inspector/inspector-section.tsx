"use client";

import type { ReactNode } from "react";

import { InspectorHelpLabel } from "@/components/cms/editor/inspector/inspector-help-label";
import { cn } from "@/lib/utils";

type InspectorSectionProps = {
  title: string;
  help: string;
  children: ReactNode;
  className?: string;
};

/**
 * Grouped inspector controls with a titled header and help tooltip.
 */
export function InspectorSection({ title, help, children, className }: InspectorSectionProps) {
  return (
    <section className={cn("border-border bg-muted/20 space-y-3 rounded-lg border p-3", className)}>
      <InspectorHelpLabel label={title} help={help} />
      {children}
    </section>
  );
}
