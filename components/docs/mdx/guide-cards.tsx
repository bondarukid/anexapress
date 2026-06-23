import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Layers,
  Rocket,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICON_MAP = {
  rocket: Rocket,
  users: Users,
  smartphone: Smartphone,
  chart: BarChart3,
  layers: Layers,
  book: BookOpen,
  billing: CreditCard,
  zap: Zap,
} as const;

export type GuideCardIcon = keyof typeof ICON_MAP;

export type GuideCardItem = {
  title: string;
  description: string;
  href: string;
  icon?: GuideCardIcon;
};

type GuideCardsProps = {
  items: GuideCardItem[];
  className?: string;
};

/** Linked card grid for “Start here” and “Related guides” sections. */
export function GuideCards({ items, className }: GuideCardsProps) {
  return (
    <div className={cn("not-prose my-8 grid gap-3 sm:grid-cols-2", className)}>
      {items.map((item) => {
        const Icon = item.icon ? ICON_MAP[item.icon] : BookOpen;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="border-border/60 bg-card hover:bg-accent/40 group flex flex-col rounded-xl border p-4 transition-colors"
          >
            <Icon className="text-primary mb-2 size-5" aria-hidden />
            <span className="font-medium group-hover:underline">{item.title}</span>
            <span className="text-muted-foreground mt-1 text-sm">{item.description}</span>
          </Link>
        );
      })}
    </div>
  );
}
