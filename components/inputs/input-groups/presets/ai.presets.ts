import type { AiInputGroupProps } from "@/components/inputs/input-groups/types";

export const aiPresets = {
  promptInput: {
    variant: "promptInput",
  },
  simplePrompt: {
    variant: "simplePrompt",
    maxCount: 4000,
  },
  withAttachments: {
    variant: "withAttachments",
    modelLabel: "GPT-4",
  },
  withVoice: {
    variant: "withVoice",
    modelLabel: "Claude 3.5",
  },
} satisfies Record<string, Partial<AiInputGroupProps>>;
