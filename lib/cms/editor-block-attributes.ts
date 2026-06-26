export const CMS_BLOCK_VARIANTS = [
  "paragraph",
  "lead",
  "muted",
  "quote",
  "callout",
] as const;

export const CMS_BLOCK_WIDTHS = ["default", "narrow", "full"] as const;
export const CMS_BLOCK_SPACING = ["none", "sm", "md", "lg"] as const;
export const CMS_BLOCK_INDENTS = ["none", "sm", "md", "lg"] as const;
export const CMS_COLOR_THEMES = ["default", "muted", "accent"] as const;
export const CMS_BLOCK_BACKGROUNDS = ["none", "muted", "accent", "warning"] as const;

export type CmsBlockVariant = (typeof CMS_BLOCK_VARIANTS)[number];
export type CmsBlockWidth = (typeof CMS_BLOCK_WIDTHS)[number];
export type CmsBlockSpacing = (typeof CMS_BLOCK_SPACING)[number];
export type CmsBlockIndent = (typeof CMS_BLOCK_INDENTS)[number];
export type CmsColorTheme = (typeof CMS_COLOR_THEMES)[number];
export type CmsBlockBackground = (typeof CMS_BLOCK_BACKGROUNDS)[number];
