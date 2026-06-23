import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import type { VariantsOtpProps } from "@/components/inputs/input-otps/types";

/**
 * Kibo UI variant OTP pattern presets.
 */
export const variantsPresets = {
  numericOnly: {
    variant: "numericOnly",
    maxLength: 6,
    pattern: REGEXP_ONLY_DIGITS,
    inputMode: "numeric",
  },
  masked: {
    variant: "masked",
    maxLength: 6,
    revealOnFocus: true,
  },
  length4: {
    variant: "differentLength",
    maxLength: 4,
  },
  length6: {
    variant: "differentLength",
    maxLength: 6,
  },
  length8: {
    variant: "differentLength",
    maxLength: 8,
    pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
  },
  joinCode: {
    variant: "differentLength",
    maxLength: 8,
    pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
    stretch: true,
  },
} satisfies Record<string, Partial<VariantsOtpProps & { stretch?: boolean }>>;
