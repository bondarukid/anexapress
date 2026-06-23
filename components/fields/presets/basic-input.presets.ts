import type { BasicInputFieldProps } from "@/components/fields/types";

/**
 * Kibo UI basic input field pattern presets.
 * https://www.kibo-ui.com/patterns/field/basic-inputs
 */
export const basicInputPresets = {
  label: {
    variant: "label",
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
  },
  descriptionBelow: {
    variant: "descriptionBelow",
    id: "username",
    label: "Username",
    placeholder: "johndoe",
    description: "Choose a unique username for your account.",
    type: "text",
  },
  descriptionAbove: {
    variant: "descriptionAbove",
    id: "password",
    label: "Password",
    placeholder: "********",
    description: "Must be at least 8 characters long.",
    descriptionPlacement: "above",
    type: "password",
  },
  multipleInGroup: {
    variant: "multipleInGroup",
    fields: [
      { id: "first-name", label: "First Name", placeholder: "John", type: "text" },
      { id: "last-name", label: "Last Name", placeholder: "Doe", type: "text" },
      { id: "email-multi", label: "Email", placeholder: "john@example.com", type: "email" },
    ],
  },
  horizontal: {
    variant: "horizontal",
    id: "display-name",
    label: "Display Name",
    placeholder: "John D.",
    labelClassName: "w-32",
    orientation: "horizontal",
    type: "text",
  },
} satisfies Record<string, Partial<BasicInputFieldProps>>;
