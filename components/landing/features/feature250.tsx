"use client";

import { Feature250Network } from "@/components/landing/features/feature250-network";
import {
  feature250Eyebrow,
  feature250Title,
} from "@/lib/landing/features/feature250-content";
import { cn } from "@/lib/utils";

type Feature250Props = {
  className?: string;
};

export function Feature250({ className }: Feature250Props) {
  return (
    <section className={cn("w-full py-32", className)}>
      <div className="mx-auto w-full max-w-5xl px-6 md:px-10">
        <p className="mx-auto mb-4 max-w-sm text-center text-muted-foreground md:text-xl">
          {feature250Eyebrow}
        </p>
        <h1 className="mx-auto -mb-12 max-w-3xl text-center text-4xl font-medium tracking-tighter md:text-6xl lg:mb-5 lg:text-7xl">
          {feature250Title}
        </h1>
        <Feature250Network />
      </div>
    </section>
  );
}
