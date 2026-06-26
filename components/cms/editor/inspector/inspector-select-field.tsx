"use client";

import type { ReactNode } from "react";

import { InspectorHelpLabel } from "@/components/cms/editor/inspector/inspector-help-label";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InspectorSelectOption } from "@/lib/cms/editor-block-settings";
import { cn } from "@/lib/utils";

type InspectorSelectFieldProps<T extends string> = {
  label: string;
  help: string;
  value: T;
  options: InspectorSelectOption<T>[];
  onValueChange: (value: T) => void;
  className?: string;
};

/**
 * Labeled select control for block inspector sections.
 */
export function InspectorSelectField<T extends string>({
  label,
  help,
  value,
  options,
  onValueChange,
  className,
}: InspectorSelectFieldProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <InspectorHelpLabel label={label} help={help} />
      <Select value={value} onValueChange={(next) => onValueChange(next as T)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type InspectorFieldGroupProps = {
  title: string;
  help: string;
  children: ReactNode;
};

/**
 * Groups multiple select fields under one inspector section card.
 */
export function InspectorFieldGroup({ title, help, children }: InspectorFieldGroupProps) {
  return (
    <section className="border-border bg-muted/20 space-y-3 rounded-lg border p-3">
      <Label className="sr-only">{title}</Label>
      <InspectorHelpLabel label={title} help={help} />
      <div className="space-y-3">{children}</div>
    </section>
  );
}
