import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type DocsChecklistProps = {
  title?: string;
  items: string[];
  className?: string;
};

/** Prerequisites checklist shown before a workflow guide. */
export function DocsChecklist({ title = "Before you begin", items, className }: DocsChecklistProps) {
  return (
    <div
      className={cn(
        "not-prose border-border/60 bg-muted/20 my-6 rounded-xl border p-4 md:p-5",
        className,
      )}
    >
      <p className="mb-3 text-sm font-medium">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
