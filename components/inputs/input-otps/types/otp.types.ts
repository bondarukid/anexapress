import type { ComponentProps, RefObject } from "react";
import type { OTPInput } from "input-otp";

export type OtpValue = string;

export type OtpInputPrimitiveProps = Omit<
  ComponentProps<typeof OTPInput>,
  "value" | "defaultValue" | "onChange" | "maxLength" | "children" | "render"
>;

/**
 * Shared props for all Kibo UI input-otp category components.
 */
export type BaseOtpProps = OtpInputPrimitiveProps & {
  value?: OtpValue;
  defaultValue?: OtpValue;
  onValueChange?: (value: OtpValue) => void;
  maxLength?: number;
  pattern?: string;
  id?: string;
  label?: string;
  description?: string;
  containerClassName?: string;
  groupClassName?: string;
  slotClassName?: string;
  separatorPositions?: number[];
  onComplete?: (value: OtpValue) => void;
  pasteTransformer?: (text: string) => string;
  inputRef?: RefObject<HTMLInputElement | null>;
  masked?: boolean;
  revealOnFocus?: boolean;
  "aria-invalid"?: boolean;
};

export const DEFAULT_OTP_LENGTH = 6;
