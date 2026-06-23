import type { BaseOtpProps } from "@/components/inputs/input-otps/types/otp.types";

export type StatesOtpVariant = "disabled" | "loading" | "error" | "success";

export type StatesOtpProps = BaseOtpProps & {
  variant?: StatesOtpVariant;
  isLoading?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  successMessage?: string;
};
