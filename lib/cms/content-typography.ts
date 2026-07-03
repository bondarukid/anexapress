import { cn } from "@/lib/utils";

/**
 * Typography classes shared by the CMS editor canvas and published HTML renderer.
 * Uses the `wysiwyg` typography plugin configured in globals.css.
 */
export const cmsContentTypographyClass =
  "wysiwyg max-w-none wysiwyg-p:leading-relaxed wysiwyg-headings:scroll-mt-20 text-foreground";

export function cmsContentTypographyClassName(className?: string): string {
  return cn(cmsContentTypographyClass, className);
}
