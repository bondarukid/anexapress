import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";

import { BrandLogo } from "@/components/docs/mdx/brand-logo";
import { DocsChecklist } from "@/components/docs/mdx/docs-checklist";
import { DocsProductShot } from "@/components/docs/mdx/docs-product-shot";
import { FeatureGrid } from "@/components/docs/mdx/feature-grid";
import { GuideCards } from "@/components/docs/mdx/guide-cards";
import { GuideHero } from "@/components/docs/mdx/guide-hero";

/**
 * MDX component map for documentation pages.
 *
 * Merges Fumadocs defaults (Callout, Cards, Steps, code blocks) with
 * BondaStefLab SaaS guide components and marketing blocks.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Tab,
    Tabs,
    BrandLogo,
    DocsChecklist,
    DocsProductShot,
    FeatureGrid,
    GuideCards,
    GuideHero,
    ...components,
  } satisfies MDXComponents;
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
