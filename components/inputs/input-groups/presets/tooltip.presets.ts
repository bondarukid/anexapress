import type { TooltipInputGroupProps } from "@/components/inputs/input-groups/types";

export const tooltipPresets = {
  passwordRequirements: {
    variant: "passwordRequirements",
  },
  helpTooltips: {
    variant: "helpTooltips",
    tooltipContent: "We'll never share your email",
  },
  apiKeyInfo: {
    variant: "apiKeyInfo",
    tooltipContent: "Found in your account settings",
  },
} satisfies Record<string, Partial<TooltipInputGroupProps>>;
