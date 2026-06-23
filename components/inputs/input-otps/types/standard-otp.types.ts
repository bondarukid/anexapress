import type { BaseOtpProps } from "@/components/inputs/input-otps/types/otp.types";

export type StandardOtpVariant =
  | "standard"
  | "patternValidation"
  | "multipleSeparators"
  | "controlled"
  | "formValidation";

export type StandardOtpProps = BaseOtpProps & {
  variant?: StandardOtpVariant;
  patternHint?: string;
  errorMessage?: string;
  showValueDisplay?: boolean;
};
