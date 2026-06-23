import { cn } from "@/lib/utils";

/**
 * Typography classes shared by the CMS editor canvas and published HTML renderer.
 * Uses the `wysiwyg` typography plugin configured in globals.css.
 */
export const cmsContentTypographyClass =
  "wysiwyg prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:scroll-mt-20";

export function cmsContentTypographyClassName(className?: string): string {
  return cn(cmsContentTypographyClass, className);
}
