import { z } from "zod";

/**
 * Validates member access updates from the permissions dialog.
 *
 * Used in:
 * - actions/team/update-member-access.ts
 */
export const updateMemberAccessSchema = z
  .object({
    workspaceId: z.uuid(),
    membershipId: z.uuid(),
    mode: z.enum(["preset", "custom"]),
    roleId: z.uuid().optional(),
    permissionKeys: z.array(z.string().min(1)).max(64),
    workspaceSlug: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "preset" && !data.roleId) {
      ctx.addIssue({
        code: "custom",
        message: "Role is required for preset mode.",
        path: ["roleId"],
      });
    }
  });

export type UpdateMemberAccessInput = z.infer<typeof updateMemberAccessSchema>;

export const getMemberAccessContextSchema = z.object({
  membershipId: z.uuid(),
});
