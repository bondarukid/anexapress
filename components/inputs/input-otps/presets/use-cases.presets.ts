import type { UseCasesOtpProps } from "@/components/inputs/input-otps/types";

/**
 * Kibo UI use-case OTP pattern presets.
 */
export const useCasesPresets = {
  emailVerification: {
    variant: "emailVerification",
    resendCooldownSeconds: 60,
  },
  twoFactorAuth: {
    variant: "twoFactorAuth",
  },
  smsVerification: {
    variant: "smsVerification",
  },
  transactionConfirmation: {
    variant: "transactionConfirmation",
    confirmLabel: "Confirm transaction",
  },
} satisfies Record<string, Partial<UseCasesOtpProps>>;
