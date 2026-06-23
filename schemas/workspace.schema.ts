import { z } from "zod";

import { isValidCountryCode } from "@/lib/countries";
import { isValidTimezone } from "@/lib/timezone/timezone-options";

/** Slug validation — lowercase alphanumeric with hyphens, 3–48 chars. */
export const workspaceSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CheckSlugSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(48, "Slug must be at most 48 characters")
    .regex(workspaceSlugRegex, "Slug may only contain lowercase letters, numbers, and hyphens"),
});

/** IANA timezone identifier for workspace defaults. */
export const WorkspaceTimezoneSchema = z
  .string()
  .min(1, "Timezone is required.")
  .refine(isValidTimezone, "Invalid timezone.");

/** Shared workspace name + slug fields for create flows. */
export const CreateWorkspaceBaseSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(80, "Workspace name is too long"),
  workspaceUrl: CheckSlugSchema.shape.slug,
  timezone: WorkspaceTimezoneSchema,
});

export type CreateWorkspaceBaseInput = z.infer<typeof CreateWorkspaceBaseSchema>;

/** Payload for createWorkspaceAction — shared between client mapping and server validation. */
export const CreateWorkspaceSchema = CreateWorkspaceBaseSchema.extend({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  position: z.string().max(100).optional(),
  country: z
    .string()
    .optional()
    .refine((value) => !value || isValidCountryCode(value), "Invalid country code"),
  gender: z.string().min(1).optional(),
  mobile: z
    .string()
    .regex(/^\+[0-9]+$/, "Phone must start with + and contain only digits")
    .max(20)
    .optional()
    .or(z.literal("")),
});

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;

/** Payload for creating an additional workspace from the dashboard (no profile update). */
export const CreateAdditionalWorkspaceSchema = CreateWorkspaceBaseSchema;

export type CreateAdditionalWorkspaceInput = CreateWorkspaceBaseInput;

/** Payload for updating an existing workspace during onboarding configure step. */
export const UpdateWorkspaceSettingsSchema = CreateWorkspaceBaseSchema.extend({
  workspaceId: z.string().uuid("Invalid workspace id"),
});

export type UpdateWorkspaceSettingsInput = z.infer<typeof UpdateWorkspaceSettingsSchema>;

export const UpdateWorkspaceTimezoneSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace id"),
  timezone: WorkspaceTimezoneSchema,
});

export type UpdateWorkspaceTimezoneInput = z.infer<typeof UpdateWorkspaceTimezoneSchema>;

/** Optional public website URL; empty string clears the stored value. */
export const UpdateWorkspaceWebsiteSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace id"),
  websiteUrl: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => value === "" || z.string().url().safeParse(value).success,
      "Enter a valid URL (e.g. https://acme.com).",
    )
    .transform((value) => (value === "" ? null : value)),
});

export type UpdateWorkspaceWebsiteInput = z.infer<typeof UpdateWorkspaceWebsiteSchema>;

/** Workspace logo file from FormData (`logoFile` field). */
export const WorkspaceLogoFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "No file selected.");

export const WorkspaceLogoMutationSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace id"),
});

export type WorkspaceLogoMutationInput = z.infer<typeof WorkspaceLogoMutationSchema>;

export const DeleteWorkspaceSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace id"),
  workspaceSlug: z.string().optional(),
});

export type DeleteWorkspaceInput = z.infer<typeof DeleteWorkspaceSchema>;

export const CreateChildWorkspaceSchema = CreateWorkspaceBaseSchema.extend({
  parentWorkspaceId: z.string().uuid("Invalid parent workspace id"),
});

export type CreateChildWorkspaceInput = z.infer<typeof CreateChildWorkspaceSchema>;

export const AttachWorkspaceToParentSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace id"),
  parentWorkspaceId: z.string().uuid("Invalid parent workspace id"),
  acceptorUserId: z.string().uuid("Invalid acceptor user id"),
});

export type AttachWorkspaceToParentInput = z.infer<typeof AttachWorkspaceToParentSchema>;

export const WorkspaceParentAttachIdSchema = z.object({
  transferId: z.string().uuid("Invalid transfer id"),
  parentSlug: z.string().optional(),
});

export type WorkspaceParentAttachIdInput = z.infer<typeof WorkspaceParentAttachIdSchema>;
