import { z } from "zod";

export const JoinCodeSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => /^[A-Z2-9]{8}$/.test(v), "Enter an 8-character join code.");

export const CreateEmailInviteSchema = z.object({
  workspaceId: z.uuid(),
  email: z.email(),
  roleId: z.uuid(),
  workspaceSlug: z.string().optional(),
});

export const CreateJoinLinkSchema = z.object({
  workspaceId: z.uuid(),
  roleId: z.uuid(),
  workspaceSlug: z.string().optional(),
  expiresInDays: z.coerce.number().int().min(1).max(90).default(14),
});

export const JoinWorkspaceByCodeSchema = z.object({
  joinCode: JoinCodeSchema,
});

/** Raw join code for pending-invite cookie (before workspace join RPC). */
export const SetPendingJoinCodeSchema = z.object({
  joinCode: JoinCodeSchema,
});

export type SetPendingJoinCodeInput = z.infer<typeof SetPendingJoinCodeSchema>;
