import { z } from "zod";

export const headerNavItemSchema = z.object({
  label: z.string().min(1).max(80),
  pageSlug: z.string().min(1).max(80),
});

export const headerCtaSchema = z.object({
  label: z.string().min(1).max(80),
  pageSlug: z.string().min(1).max(80),
});

export const headerLogoSchema = z.object({
  mediaId: z.string().uuid().nullable().optional(),
  text: z.string().min(1).max(120),
  href: z.string().max(500).optional(),
});

export const headerConfigSchema = z.object({
  logo: headerLogoSchema,
  nav: z.array(headerNavItemSchema).max(12),
  cta: headerCtaSchema.optional(),
  showAuthLinks: z.boolean().optional(),
});

export const footerLinkSchema = z.object({
  label: z.string().min(1).max(80),
  pageSlug: z.string().max(80).optional(),
  externalUrl: z.string().url().optional(),
});

export const footerColumnSchema = z.object({
  title: z.string().min(1).max(80),
  links: z.array(footerLinkSchema).max(20),
});

export const footerSocialSchema = z.object({
  platform: z.enum(["twitter", "github", "linkedin", "youtube", "instagram"]),
  url: z.string().url(),
});

export const footerConfigSchema = z.object({
  tagline: z.string().max(300).optional(),
  columns: z.array(footerColumnSchema).max(6),
  socials: z.array(footerSocialSchema).max(10),
  copyright: z.string().max(300).optional(),
});

export const themeConfigSchema = z.object({
  primaryColor: z.string().max(50).optional(),
});

export const updateSiteLayoutSchema = z.object({
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  headerConfig: headerConfigSchema,
  footerConfig: footerConfigSchema,
  themeConfig: themeConfigSchema.optional(),
});

export type HeaderConfig = z.infer<typeof headerConfigSchema>;
export type FooterConfig = z.infer<typeof footerConfigSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type UpdateSiteLayoutInput = z.infer<typeof updateSiteLayoutSchema>;

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  logo: { text: "My Site" },
  nav: [{ label: "Blog", pageSlug: "blog" }],
  showAuthLinks: false,
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [],
  socials: [],
};
