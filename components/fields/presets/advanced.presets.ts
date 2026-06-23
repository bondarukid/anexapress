import type { AdvancedFieldProps } from "@/components/fields/types";

/**
 * Kibo UI advanced field pattern presets.
 * https://www.kibo-ui.com/patterns/field/advanced
 */
export const advancedPresets = {
  simpleSlider: {
    variant: "simpleSlider",
    title: "Volume",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: [50],
  },
  rangeSlider: {
    variant: "rangeSlider",
    title: "Price Range",
    min: 0,
    max: 1000,
    step: 10,
    defaultValue: [200, 800],
  },
  choiceCards: {
    variant: "choiceCards",
    label: "Compute Environment",
    description: "Select the compute environment for your cluster.",
    defaultChoice: "kubernetes",
    choices: [
      {
        id: "kubernetes",
        value: "kubernetes",
        title: "Kubernetes",
        description: "Run GPU workloads on a K8s configured cluster.",
      },
      {
        id: "vm",
        value: "vm",
        title: "Virtual Machine",
        description: "Access a VM configured cluster to run GPU workloads.",
      },
    ],
  },
  fieldsetLegend: {
    variant: "fieldsetLegend",
    legend: "Address Information",
    description: "We need your address to deliver your order.",
    fields: [
      { id: "street", label: "Street Address", placeholder: "123 Main St", type: "text" },
      {
        id: "city",
        label: "City",
        placeholder: "New York",
        type: "text",
        gridClassName: "col-span-1",
      },
      {
        id: "zip",
        label: "Postal Code",
        placeholder: "90502",
        type: "text",
        gridClassName: "col-span-1",
      },
    ],
    sections: [
      {
        legend: "Address Information",
        description: "We need your address to deliver your order.",
        fields: [
          { id: "street", label: "Street Address", placeholder: "123 Main St", type: "text" },
          { id: "city", label: "City", placeholder: "New York", type: "text", gridClassName: "" },
          { id: "zip", label: "Postal Code", placeholder: "90502", type: "text", gridClassName: "" },
        ],
        gridClassName: "grid grid-cols-2 gap-4 [&>*:first-child]:col-span-2",
      },
    ],
  },
  fieldGroupSeparator: {
    variant: "fieldGroupSeparator",
    sections: [
      {
        label: "Responses",
        description:
          "Get notified when ChatGPT responds to requests that take time, like research or image generation.",
        checkboxGroup: true,
        toggles: [{ id: "push", label: "Push notifications", defaultChecked: true, disabled: true }],
      },
      {
        separator: undefined,
        label: "Tasks",
        description: "Get notified when tasks you've created have updates.",
        checkboxGroup: true,
        toggles: [
          { id: "push-tasks", label: "Push notifications" },
          { id: "email-tasks", label: "Email notifications" },
        ],
      },
    ],
  },
  complexForm: {
    variant: "complexForm",
    sections: [
      {
        legend: "Personal Information",
        fields: [
          { id: "first", label: "First Name", placeholder: "John", type: "text" },
          { id: "last", label: "Last Name", placeholder: "Doe", type: "text" },
          { id: "email-complex", label: "Email", placeholder: "john@example.com", type: "email" },
        ],
        selects: [
          {
            id: "country",
            label: "Country",
            placeholder: "Select country",
            options: [
              { value: "us", label: "United States" },
              { value: "uk", label: "United Kingdom" },
              { value: "ca", label: "Canada" },
            ],
          },
        ],
        gridClassName: "grid grid-cols-2 gap-4 [&>*:nth-child(3)]:col-span-2 [&>*:nth-child(4)]:col-span-2",
      },
    ],
  },
  mixedTypes: {
    variant: "mixedTypes",
    separatorLabel: "Additional Details",
    sections: [
      {
        label: "Contact Information",
        description: "How should we get in touch with you?",
        fields: [
          { id: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000", type: "tel" },
          { id: "contact-email", label: "Email Address", placeholder: "you@example.com", type: "email" },
        ],
      },
      {
        separator: "Additional Details",
        textareas: [
          {
            id: "additional-info",
            label: "Additional Information",
            placeholder: "Any other details you'd like to share...",
            rows: 3,
          },
        ],
      },
    ],
  },
} satisfies Record<string, Partial<AdvancedFieldProps>>;
