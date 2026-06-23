import type { RightDrawerProps } from "@/components/drawers/types";

export const rightPresets = {
  simple: {
    title: "Right Drawer",
    description: "A simple right-side panel.",
    bodyText: "Panel content appears here.",
  },
  withForm: {
    title: "Edit details",
    description: "Update the information below.",
    fields: [
      { id: "name", label: "Name", defaultValue: "John Doe" },
      { id: "email", label: "Email", type: "email", defaultValue: "john@example.com" },
    ],
  },
  filterPanel: {
    title: "Filters",
    description: "Refine your results.",
    filterSections: [
      {
        id: "status",
        label: "Status",
        options: [
          { id: "active", label: "Active", checked: true },
          { id: "archived", label: "Archived" },
        ],
      },
      {
        id: "type",
        label: "Type",
        options: [
          { id: "document", label: "Document" },
          { id: "image", label: "Image", checked: true },
        ],
      },
      {
        id: "date",
        label: "Date range",
        options: [
          { id: "today", label: "Today" },
          { id: "week", label: "This week", checked: true },
        ],
      },
    ],
  },
  settingsPanel: {
    title: "Settings",
    settingGroups: [
      {
        id: "notifications",
        label: "Notifications",
        items: [
          {
            id: "email",
            label: "Email notifications",
            description: "Receive updates via email",
            checked: true,
          },
          {
            id: "push",
            label: "Push notifications",
            description: "Browser push alerts",
          },
        ],
      },
      {
        id: "privacy",
        label: "Privacy",
        items: [
          {
            id: "profile",
            label: "Public profile",
            description: "Show profile to others",
            checked: true,
          },
        ],
      },
    ],
  },
  shoppingCart: {
    title: "Shopping cart",
    cartItems: [
      { id: "1", name: "Wireless headphones", price: 79.99, quantity: 1 },
      { id: "2", name: "USB-C cable", price: 12.99, quantity: 2 },
    ],
  },
  notifications: {
    title: "Notifications",
    notifications: [
      {
        id: "1",
        title: "New comment",
        message: "Alex replied to your thread.",
        time: "2 min ago",
        read: false,
      },
      {
        id: "2",
        title: "Deployment complete",
        message: "Production deploy finished successfully.",
        time: "1 hour ago",
        read: true,
      },
    ],
  },
} satisfies Record<string, Partial<RightDrawerProps>>;
