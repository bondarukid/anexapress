import type { TextareaFieldProps } from "@/components/fields/types";

/**
 * Kibo UI textarea field pattern presets.
 * https://www.kibo-ui.com/patterns/field/text-areas
 */
export const textareaPresets = {
  simple: {
    variant: "simple",
    id: "message",
    label: "Message",
    placeholder: "Type your message here...",
  },
  withDescription: {
    variant: "withDescription",
    id: "feedback",
    label: "Feedback",
    placeholder: "Your feedback helps us improve...",
    description: "Share your thoughts about our service.",
    rows: 4,
  },
  characterCount: {
    variant: "characterCount",
    id: "bio",
    label: "Bio",
    placeholder: "Tell us about yourself...",
    maxLength: 500,
    rows: 4,
  },
  helperAbove: {
    variant: "helperAbove",
    id: "description",
    label: "Description",
    placeholder: "# Heading\n\nYour description here...",
    description: "Provide a detailed description. Markdown is supported.",
    descriptionPlacement: "above",
    rows: 6,
  },
  multipleSizes: {
    variant: "multipleSizes",
    textareas: [
      { id: "short-note", label: "Short Note", placeholder: "Brief note...", rows: 2 },
      { id: "medium-comment", label: "Comment", placeholder: "Your comment...", rows: 4 },
      { id: "long-essay", label: "Essay", placeholder: "Write your essay...", rows: 8 },
    ],
  },
  detailedInstructions: {
    variant: "detailedInstructions",
    id: "issue",
    label: "Issue Description",
    description:
      "Describe the issue you're experiencing in detail. Include steps to reproduce if applicable. Our team will review within 24 hours.",
    placeholder: "1. I tried to...\n2. Then I...",
    descriptionPlacement: "above",
    rows: 5,
  },
} satisfies Record<string, Partial<TextareaFieldProps>>;
