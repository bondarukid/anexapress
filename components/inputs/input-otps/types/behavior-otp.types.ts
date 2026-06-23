import type { RefObject } from "react";

import type { BaseOtpProps } from "@/components/inputs/input-otps/types/otp.types";

export type BehaviorOtpVariant =
  | "autoSubmit"
  | "enhancedFocus"
  | "pasteOptimization"
  | "resendFlow";

export type BehaviorOtpProps = BaseOtpProps & {
  variant?: BehaviorOtpVariant;
  onAutoSubmit?: (value: string) => void;
  formRef?: RefObject<HTMLFormElement | null>;
  pasteButtonLabel?: string;
  onPasteSuccess?: (value: string) => void;
  onPasteError?: (error: unknown) => void;
  resendCooldownSeconds?: number;
  resendLabel?: string;
  onResend?: () => void | Promise<void>;
  clearOnResend?: boolean;
};
