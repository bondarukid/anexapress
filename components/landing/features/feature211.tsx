"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { ArrowRight } from "lucide-react";

import { Feature211Media } from "@/components/landing/features/feature211-media";
import { ScrollableTabsList } from "@/components/landing/features/scrollable-tabs-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { feature211Tabs } from "@/lib/landing/features/feature211-content";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-feature211-serif",
});

const PANEL_HEIGHT = "min-h-[38.75rem]";

type Feature211Props = {
  className?: string;
};

export function Feature211({ className }: Feature211Props) {
  const defaultTab = feature211Tabs[0]?.tabName ?? "";

  return (
    <section className={cn("w-full py-32", playfair.variable, className)}>
      <div className="mx-auto w-full max-w-5xl px-6 md:px-10 lg:max-w-6xl xl:max-w-7xl">
        <Tabs defaultValue={defaultTab} className="flex flex-col-reverse gap-8">
          <ScrollableTabsList>
            <TabsList className="mx-auto flex !h-auto justify-start overflow-y-hidden bg-transparent px-2 lg:w-max lg:items-center lg:justify-center lg:rounded-full">
              {feature211Tabs.map((tab) => (
                <TabsTrigger
                  key={`trigger-${tab.tabName}`}
                  className="shrink-0 rounded-full px-4 py-2 text-sm leading-tight font-medium"
                  value={tab.tabName}
                >
                  {tab.tabName}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollableTabsList>

          {feature211Tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsContent
                key={`content-${tab.tabName}`}
                value={tab.tabName}
                className={cn(
                  "grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[37.5rem_minmax(0,1fr)]",
                  PANEL_HEIGHT,
                )}
              >
                <div className={cn("flex flex-col gap-4 px-4 sm:px-8 lg:px-0 lg:pl-4 xl:pl-18", PANEL_HEIGHT)}>
                  <div className="flex size-8 shrink-0 rounded-lg bg-primary text-primary-foreground">
                    <Icon className="m-auto size-4" />
                  </div>
                  <h2
                    className={cn(
                      "min-h-[5.5rem] font-serif text-4xl sm:text-5xl xl:min-h-[8.5rem] xl:text-7xl",
                      playfair.className,
                    )}
                  >
                    {tab.title}
                  </h2>
                  <p className="min-h-[5.5rem] text-xl text-foreground">{tab.summary}</p>
                  <div className="mt-auto min-h-11">
                    {tab.link ? (
                      <Button asChild size="lg" className="w-full md:w-fit">
                        <Link href={tab.link.href}>
                          {tab.link.name}
                          <ArrowRight />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="h-[32rem] min-w-0 w-full justify-self-end sm:h-[36rem] xl:h-[38.75rem]">
                  <Feature211Media variant={tab.imageComponent} images={tab.images} />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
