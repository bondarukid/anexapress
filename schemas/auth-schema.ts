import { z } from "zod";

/** OAuth providers supported for account linking (Supabase identity provider names). */
export const OAuthProviderSchema = z.enum(["google", "github"]);

export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

export const SignInCredentialsSchema = z.object({
  email: z.string().trim().min(1, "Email and password are required."),
  password: z.string().min(1, "Email and password are required."),
});

export type SignInCredentialsInput = z.infer<typeof SignInCredentialsSchema>;

export const SignUpCredentialsSchema = SignInCredentialsSchema.extend({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});

export type SignUpCredentialsInput = z.infer<typeof SignUpCredentialsSchema>;

export const PasswordResetEmailSchema = z.object({
  email: z.string().trim().min(1, "Email is required."),
});

export type PasswordResetEmailInput = z.infer<typeof PasswordResetEmailSchema>;

export const RecoveryPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type RecoveryPasswordInput = z.infer<typeof RecoveryPasswordSchema>;

export const UpdatePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "All fields are required."),
  newPassword: z.string().min(1, "All fields are required."),
});

export type UpdatePasswordFormInput = z.infer<typeof UpdatePasswordFormSchema>;

export const EnableEmailLoginSchema = z.object({
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .refine(
      (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value),
      "Password does not meet strength requirements.",
    ),
});

export type EnableEmailLoginInput = z.infer<typeof EnableEmailLoginSchema>;
