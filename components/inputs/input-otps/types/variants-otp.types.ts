import type { BaseOtpProps } from "@/components/inputs/input-otps/types/otp.types";

export type VariantsOtpVariant = "numericOnly" | "masked" | "differentLength";

export type VariantsOtpProps = BaseOtpProps & {
  variant?: VariantsOtpVariant;
  revealOnFocus?: boolean;
  /** Stretch slots to fill container width (useful for 8-char join codes). */
  stretch?: boolean;
};
