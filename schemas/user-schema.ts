import { z } from "zod";
import { isValidCountryCode } from "@/lib/countries";
import { isValidTimezone } from "@/lib/timezone/timezone-options";
import { WORKSPACE_ROLE_VALUES } from "@/lib/workspace/workspace.constants";

const optionalMobileSchema = z
  .string()
  .regex(/^\+[0-9]+$/, "Phone must start with + and contain only digits")
  .max(20)
  .optional()
  .or(z.literal(""));

/** IANA timezone for personal notification and schedule preferences. */
export const TimezoneSchema = z
  .string()
  .min(1, "Timezone is required.")
  .refine(isValidTimezone, "Invalid timezone.");

/** Onboarding profile completion (invite path without new workspace). */
export const CompleteProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  country: z
    .string()
    .optional()
    .refine((value) => !value || isValidCountryCode(value), "Invalid country code"),
  gender: z.string().optional(),
  mobile: optionalMobileSchema,
  timezone: TimezoneSchema,
});

export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>;

/** Options for deleteAccountAction. */
export const DeleteAccountOptionsSchema = z.object({
  deleteSoloWorkspaces: z.boolean().optional(),
});

export type DeleteAccountOptionsInput = z.infer<typeof DeleteAccountOptionsSchema>;

/** Avatar file from FormData (`avatarFile` field). */
export const AvatarFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Файл не выбран.");

// Схема валидации для формы (Zod проверяет входящие данные на сервере)
export const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Имя должно быть не менее 2 символов")
    .max(50, "Имя слишком длинное"),
  lastName: z
    .string()
    .min(2, "Фамилия должна быть не менее 2 символов")
    .max(50, "Фамилия слишком длинная"),
  company: z.string().max(100, "Название компании слишком длинное").optional(),
  position: z
    .enum(WORKSPACE_ROLE_VALUES, {
      message: "Выберите роль из списка",
    })
    .optional(),
  mobile: z
    .string()
    .regex(/^\+[0-9]+$/, "Номер телефона должен начинаться с + и содержать только цифры")
    .max(20, "Номер телефона слишком длинный"),
  country: z.string().refine(isValidCountryCode, "Выберите страну"),
  gender: z.string().min(1, "Выберите пол"),
});

export const UpdateProfileTimezoneSchema = z.object({
  timezone: TimezoneSchema,
});

export type UpdateProfileTimezoneInput = z.infer<typeof UpdateProfileTimezoneSchema>;
