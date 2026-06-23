"use client";

import { useCallback, useState } from "react";

import type { OtpValue } from "@/components/inputs/input-otps/types/otp.types";

type UseControllableOtpOptions = {
  value?: OtpValue;
  defaultValue?: OtpValue;
  onValueChange?: (value: OtpValue) => void;
  maxLength?: number;
};

function normalizeOtpValue(value: OtpValue | undefined, maxLength: number): OtpValue {
  return (value ?? "").slice(0, maxLength);
}

/**
 * Controlled/uncontrolled OTP state shared across category components.
 */
export function useControllableOtp({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  maxLength = 6,
}: UseControllableOtpOptions) {
  const [uncontrolledValue, setUncontrolledValue] = useState<OtpValue>(() =>
    normalizeOtpValue(defaultValue, maxLength),
  );

  const isControlled = valueProp !== undefined;
  const value = isControlled
    ? normalizeOtpValue(valueProp, maxLength)
    : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: OtpValue) => {
      const normalized = normalizeOtpValue(nextValue, maxLength);

      if (!isControlled) {
        setUncontrolledValue(normalized);
      }

      onValueChange?.(normalized);
    },
    [isControlled, maxLength, onValueChange],
  );

  const clearValue = useCallback(() => {
    setValue("");
  }, [setValue]);

  return { value, setValue, clearValue };
}
