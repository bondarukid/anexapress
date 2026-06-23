"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

type GuideHeroProps = {
  badge?: string;
  children?: ReactNode;
  className?: string;
};

/** Animated intro block for documentation guides. */
export function GuideHero({ badge, children, className }: GuideHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "not-prose border-border/60 bg-muted/30 mb-8 rounded-xl border px-5 py-6 md:px-6",
        className,
      )}
    >
      {badge ? (
        <span className="bg-primary/10 text-primary mb-3 inline-flex rounded-full px-3 py-1 text-xs font-medium">
          {badge}
        </span>
      ) : null}
      {children ? (
        <div className="text-muted-foreground text-base leading-relaxed md:text-lg [&>p]:m-0">
          {children}
        </div>
      ) : null}
    </motion.div>
  );
}
