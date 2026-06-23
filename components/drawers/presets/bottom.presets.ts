import type { BottomDrawerProps } from "@/components/drawers/types";

export const bottomPresets = {
  simple: {
    title: "Bottom Drawer",
    description: "A simple bottom drawer panel.",
    bodyText: "Drawer content appears here.",
  },
  withForm: {
    title: "Edit details",
    description: "Update the information below.",
    fields: [
      { id: "name", label: "Name", defaultValue: "John Doe" },
      { id: "email", label: "Email", type: "email", defaultValue: "john@example.com" },
    ],
  },
  scrollable: {
    title: "Scrollable content",
    description: "Long list inside a bottom drawer.",
    scrollItems: Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
  },
  snapPoints: {
    title: "Snap points",
    description: "Drag between snap positions.",
    snapPoints: [0.35, 0.65, 1],
    bodyText: "Swipe up or down to snap between heights.",
  },
  nested: {
    title: "Parent drawer",
    description: "Open a nested drawer from inside.",
    nestedTitle: "Nested drawer",
    nestedDescription: "Secondary drawer content.",
    nestedTriggerLabel: "Open nested drawer",
  },
  noScaleBackground: {
    title: "No scale background",
    description: "Background scaling is disabled.",
    shouldScaleBackground: false,
    bodyText: "The page background does not scale when this drawer opens.",
  },
  eventDetails: {
    title: "Team standup",
    description: "Weekly sync meeting",
    eventDate: "Monday, Jun 8",
    eventTime: "10:00 AM – 10:30 AM",
    eventLocation: "Conference Room A",
    eventAttendees: "12 attendees",
    eventActions: [
      { id: "rsvp", label: "RSVP" },
      { id: "calendar", label: "Add to calendar", variant: "outline" },
    ],
  },
} satisfies Record<string, Partial<BottomDrawerProps>>;
