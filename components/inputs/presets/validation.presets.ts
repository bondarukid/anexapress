import type { ValidationInputProps, ValidationRule } from "@/components/inputs/types";

const defaultPasswordRules: ValidationRule[] = [
  { text: "At least 8 characters", validate: (value) => value.length >= 8 },
  { text: "Contains a number", validate: (value) => /\d/.test(value) },
  { text: "Contains uppercase letter", validate: (value) => /[A-Z]/.test(value) },
  {
    text: "Contains special character",
    validate: (value) => /[!@#$%^&*]/.test(value),
  },
];

/**
 * Kibo UI validation input pattern presets.
 */
export const validationPresets = {
  error: {
    variant: "error",
    id: "email-error",
    label: "Email",
    defaultValue: "invalid-email",
    placeholder: "you@example.com",
    message: "Please enter a valid email address",
    inputProps: { type: "email" },
  },
  success: {
    variant: "success",
    id: "username-success",
    label: "Username",
    defaultValue: "haydenbleasel",
    placeholder: "johndoe",
    message: "Username is available",
  },
  warning: {
    variant: "warning",
    id: "password-warning",
    label: "Password",
    defaultValue: "weak123",
    placeholder: "Enter password",
    message: "Password is weak. Consider using a stronger password",
    inputProps: { type: "password" },
  },
  multipleMessages: {
    variant: "multipleMessages",
    id: "password-multiple",
    label: "Password",
    defaultValue: "pass",
    placeholder: "Enter password",
    messages: [
      "Password must be at least 8 characters",
      "Password must contain at least one number",
      "Password must contain at least one special character",
    ],
    inputProps: { type: "password" },
  },
  realtimeValidation: {
    variant: "realtimeValidation",
    id: "password-realtime",
    label: "Create Password",
    placeholder: "Enter password",
    rules: defaultPasswordRules,
    inputProps: { type: "password" },
  },
} satisfies Record<string, Partial<ValidationInputProps>>;

export { defaultPasswordRules };
