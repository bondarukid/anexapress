import type { StatesOtpProps } from "@/components/inputs/input-otps/types";

/**
 * Kibo UI states OTP pattern presets.
 */
export const statesPresets = {
  disabled: {
    variant: "disabled",
    maxLength: 6,
    label: "Verification code",
  },
  loading: {
    variant: "loading",
    maxLength: 6,
    loadingMessage: "Verifying code…",
  },
  error: {
    variant: "error",
    maxLength: 6,
    errorMessage: "Invalid code. Please try again.",
  },
  success: {
    variant: "success",
    maxLength: 6,
    successMessage: "Code verified successfully.",
  },
} satisfies Record<string, Partial<StatesOtpProps>>;
