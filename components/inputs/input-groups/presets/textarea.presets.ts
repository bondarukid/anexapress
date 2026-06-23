import type { TextareaInputGroupProps } from "@/components/inputs/input-groups/types";

export const textareaPresets = {
  codeEditor: {
    variant: "codeEditor",
    languageLabel: "script.js",
  },
  characterCounter: {
    variant: "characterCounter",
    maxCount: 500,
  },
  richTextToolbar: {
    variant: "richTextToolbar",
  },
  chatInput: {
    variant: "chatInput",
    maxCount: 2000,
  },
} satisfies Record<string, Partial<TextareaInputGroupProps>>;
