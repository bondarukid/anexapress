import type { BehaviorOtpProps } from "@/components/inputs/input-otps/types";

/**
 * Kibo UI behavior OTP pattern presets.
 */
export const behaviorPresets = {
  autoSubmit: {
    variant: "autoSubmit",
    maxLength: 6,
    label: "One-time password",
  },
  enhancedFocus: {
    variant: "enhancedFocus",
    maxLength: 6,
    label: "One-time password",
  },
  pasteOptimization: {
    variant: "pasteOptimization",
    maxLength: 6,
    pasteButtonLabel: "Paste code",
  },
  resendFlow: {
    variant: "resendFlow",
    maxLength: 6,
    resendCooldownSeconds: 60,
    resendLabel: "Resend code",
  },
} satisfies Record<string, Partial<BehaviorOtpProps>>;
