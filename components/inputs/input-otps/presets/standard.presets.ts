import type { StandardOtpProps } from "@/components/inputs/input-otps/types";

/**
 * Kibo UI standard OTP pattern presets.
 */
export const standardPresets = {
  standard: {
    variant: "standard",
    maxLength: 6,
    label: "Verification code",
  },
  patternValidation: {
    variant: "patternValidation",
    maxLength: 6,
    patternHint: "Digits only",
  },
  multipleSeparators: {
    variant: "multipleSeparators",
    maxLength: 6,
    separatorPositions: [3],
  },
  controlled: {
    variant: "controlled",
    maxLength: 6,
    showValueDisplay: true,
  },
  formValidation: {
    variant: "formValidation",
    maxLength: 6,
    label: "Verification code",
    errorMessage: "Invalid code. Please try again.",
  },
} satisfies Record<string, Partial<StandardOtpProps>>;
