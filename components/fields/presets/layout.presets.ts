import type { LayoutFieldProps } from "@/components/fields/types";

/**
 * Kibo UI layout field pattern presets.
 * https://www.kibo-ui.com/patterns/field/layouts
 */
export const layoutPresets = {
  vertical: {
    variant: "vertical",
    fields: [
      {
        id: "name-vertical",
        label: "Name",
        placeholder: "Your name",
        description: "This will be displayed publicly.",
        type: "text",
      },
      {
        id: "email-vertical",
        label: "Email",
        placeholder: "you@example.com",
        description: "We'll never share your email.",
        type: "email",
      },
    ],
  },
  horizontal: {
    variant: "horizontal",
    fields: [
      {
        id: "name-horizontal",
        label: "Name",
        placeholder: "Your name",
        orientation: "horizontal",
        labelClassName: "w-32",
        type: "text",
      },
    ],
    selects: [
      {
        id: "role-horizontal",
        label: "Role",
        placeholder: "Select role",
        orientation: "horizontal",
        labelClassName: "w-32",
        options: [
          { value: "admin", label: "Admin" },
          { value: "editor", label: "Editor" },
          { value: "viewer", label: "Viewer" },
        ],
      },
    ],
  },
  responsive: {
    variant: "responsive",
    fields: [
      {
        id: "display-name-r",
        label: "Display Name",
        placeholder: "John Doe",
        orientation: "responsive",
        type: "text",
      },
      {
        id: "username-r",
        label: "Username",
        placeholder: "@johndoe",
        orientation: "responsive",
        type: "text",
      },
    ],
  },
  grid: {
    variant: "grid",
    gridClassName: "grid grid-cols-2 gap-4",
    fields: [
      { id: "grid-first", label: "First Name", placeholder: "John", type: "text" },
      { id: "grid-last", label: "Last Name", placeholder: "Doe", type: "text" },
      { id: "grid-email", label: "Email", placeholder: "john@example.com", type: "email" },
    ],
  },
  nested: {
    variant: "nested",
    legend: "Account Settings",
    sections: [
      {
        label: "Profile",
        fields: [
          { id: "nested-name", label: "Display Name", placeholder: "John Doe", type: "text" },
        ],
        nestedGroups: [
          {
            label: "Contact",
            fields: [
              { id: "nested-email", label: "Email", placeholder: "you@example.com", type: "email" },
            ],
          },
        ],
      },
    ],
  },
  mixedOrientations: {
    variant: "mixedOrientations",
    fields: [
      {
        id: "mixed-name",
        label: "Workspace name",
        placeholder: "Acme Sustainability",
        type: "text",
      },
    ],
    toggles: [
      { id: "mixed-public", label: "Share with workspace members", value: "public" },
      { id: "mixed-notify", label: "Send notifications", value: "notify" },
    ],
  },
} satisfies Record<string, Partial<LayoutFieldProps>>;
