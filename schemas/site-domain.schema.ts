import { z } from "zod";

const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;

export const siteDomainSchema = z
  .string()
  .min(3)
  .max(253)
  .transform((v) => v.toLowerCase().trim())
  .refine((v) => domainRegex.test(v), "Invalid domain name");

export const addSiteDomainSchema = z.object({
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  domain: siteDomainSchema,
  isPrimary: z.boolean().optional(),
});

export const removeSiteDomainSchema = z.object({
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  domainId: z.string().uuid(),
});

export const setPrimarySiteDomainSchema = z.object({
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  domainId: z.string().uuid(),
});

export type AddSiteDomainInput = z.infer<typeof addSiteDomainSchema>;
export type RemoveSiteDomainInput = z.infer<typeof removeSiteDomainSchema>;
export type SetPrimarySiteDomainInput = z.infer<typeof setPrimarySiteDomainSchema>;
