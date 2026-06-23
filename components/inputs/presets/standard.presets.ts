import type { StandardInputProps } from "@/components/inputs/types";

/**
 * Kibo UI standard input pattern presets.
 */
export const standardPresets = {
  label: {
    variant: "label",
    id: "name",
    label: "Name",
    placeholder: "Enter your name",
  },
  description: {
    variant: "description",
    id: "username",
    label: "Username",
    description: "This will be your unique identifier on the platform.",
    placeholder: "johndoe",
  },
  helperText: {
    variant: "helperText",
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    helperText: "We'll never share your email with anyone else.",
    inputProps: { type: "email" },
  },
  required: {
    variant: "required",
    id: "fullname",
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
    requiredHint: "* Required field",
  },
  optional: {
    variant: "optional",
    id: "middlename",
    label: "Middle Name",
    placeholder: "Enter your middle name",
    optionalLabel: "(optional)",
  },
  characterCounter: {
    variant: "characterCounter",
    id: "bio",
    label: "Bio",
    placeholder: "Tell us about yourself",
    maxLength: 50,
  },
  inlineLabel: {
    variant: "inlineLabel",
    id: "age",
    label: "Age",
    placeholder: "25",
    inputProps: { type: "number" },
  },
} satisfies Record<string, Partial<StandardInputProps>>;
