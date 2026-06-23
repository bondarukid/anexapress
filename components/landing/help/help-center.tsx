import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Layers,
  FileBarChart,
  Rocket,
  Shield,
  User,
} from "lucide-react";

import { HelpCenterContact } from "@/components/landing/help/help-center-contact";
import { Card, CardContent } from "@/components/ui/card";
import {
  helpCategories,
  helpCenterDefaults,
  helpPopularTopics,
} from "@/lib/help/content";
import { cn } from "@/lib/utils";
import type { HelpCategory, HelpCategoryId, PopularTopic } from "@/types/help";

const categoryIcons: Record<HelpCategoryId, ReactNode> = {
  "getting-started": <Rocket className="size-5" />,
  workspaces: <Layers className="size-5" />,
  billing: <CreditCard className="size-5" />,
  reporting: <FileBarChart className="size-5" />,
  account: <User className="size-5" />,
  security: <Shield className="size-5" />,
};

export type HelpCenterProps = {
  title?: string;
  description?: string;
  categories?: HelpCategory[];
  popularTopics?: PopularTopic[];
  className?: string;
};

export function HelpCenter({
  title = helpCenterDefaults.title,
  description = helpCenterDefaults.description,
  categories = helpCategories,
  popularTopics = helpPopularTopics,
  className,
}: HelpCenterProps) {
  return (
    <section className={cn("flex w-full items-center justify-center py-16", className)}>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/help#${category.id}`} id={category.id} className="scroll-mt-24">
              <Card className="group hover:bg-muted/50 h-full cursor-pointer gap-0 p-0 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground shrink-0">{categoryIcons[category.id]}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{category.title}</h3>
                        <ChevronRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        {category.articles} articles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="mb-3 text-lg font-medium">Popular Topics</h2>
          <div className="-mx-2 grid sm:grid-cols-2 lg:grid-cols-3">
            {popularTopics.map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className="hover:bg-background flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
              >
                <ChevronRight className="text-muted-foreground size-4" />
                {topic.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <HelpCenterContact />
        </div>
      </div>
    </section>
  );
}
