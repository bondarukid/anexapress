import type { BehaviorOtpProps } from "@/components/inputs/input-otps/types/behavior-otp.types";

export type UseCasesOtpVariant =
  | "emailVerification"
  | "twoFactorAuth"
  | "smsVerification"
  | "transactionConfirmation";

export type UseCasesOtpProps = Omit<BehaviorOtpProps, "variant"> & {
  variant?: UseCasesOtpVariant;
  confirmLabel?: string;
  onConfirm?: (value: string) => void;
};
