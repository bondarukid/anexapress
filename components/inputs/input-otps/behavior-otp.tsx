"use client";

import { useRef } from "react";
import { ClipboardPasteIcon } from "lucide-react";

import type { BehaviorOtpProps } from "@/components/inputs/input-otps/types";
import { DEFAULT_OTP_LENGTH } from "@/components/inputs/input-otps/types/otp.types";
import { StandardOtp } from "@/components/inputs/input-otps/standard-otp";
import {
  defaultPasteTransformer,
  readOtpFromClipboard,
} from "@/components/inputs/input-otps/utils/otp-paste";
import { useControllableOtp } from "@/components/inputs/input-otps/utils/use-controllable-otp";
import { useOtpResend } from "@/components/inputs/input-otps/utils/use-otp-resend";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Behavioral OTP input covering Kibo UI behavior patterns.
 * https://www.kibo-ui.com/patterns/input-otp/behavior
 */
export function BehaviorOtp({
  variant = "autoSubmit",
  value: valueProp,
  defaultValue,
  onValueChange,
  maxLength = DEFAULT_OTP_LENGTH,
  onAutoSubmit,
  formRef,
  pasteButtonLabel = "Paste code",
  onPasteSuccess,
  onPasteError,
  resendCooldownSeconds = 60,
  resendLabel = "Resend code",
  onResend,
  clearOnResend = true,
  pasteTransformer = defaultPasteTransformer,
  inputRef: inputRefProp,
  containerClassName,
  onComplete,
  ...rest
}: BehaviorOtpProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = inputRefProp ?? internalRef;

  const { value, setValue, clearValue } = useControllableOtp({
    value: valueProp,
    defaultValue,
    onValueChange,
    maxLength,
  });

  const { secondsLeft, canResend, isResending, handleResend } = useOtpResend({
    cooldownSeconds: resendCooldownSeconds,
    onResend,
    onResendComplete: clearOnResend ? clearValue : undefined,
  });

  const handleComplete = (completedValue: string) => {
    onComplete?.(completedValue);

    if (variant !== "autoSubmit") {
      return;
    }

    if (onAutoSubmit) {
      onAutoSubmit(completedValue);
      return;
    }

    formRef?.current?.requestSubmit();
  };

  const handlePaste = async () => {
    try {
      const pasted = await readOtpFromClipboard({
        maxLength,
        transform: pasteTransformer,
      });
      setValue(pasted);
      onPasteSuccess?.(pasted);
    } catch (error) {
      onPasteError?.(error);
    }
  };

  const handleFocusClick = () => {
    inputRef.current?.focus();
  };

  const otpInput = (
    <StandardOtp
      value={value}
      onValueChange={setValue}
      maxLength={maxLength}
      onComplete={handleComplete}
      pasteTransformer={pasteTransformer}
      inputRef={inputRef}
      variant="standard"
      {...rest}
    />
  );

  if (variant === "enhancedFocus") {
    return (
      <div
        role="presentation"
        className={cn("cursor-text", containerClassName)}
        onClick={handleFocusClick}
        onKeyDown={() => {}}
      >
        {otpInput}
      </div>
    );
  }

  if (variant === "pasteOptimization") {
    return (
      <div className={cn("flex flex-col gap-3", containerClassName)}>
        {otpInput}
        <Button type="button" variant="outline" size="sm" onClick={() => void handlePaste()}>
          <ClipboardPasteIcon data-icon="inline-start" />
          {pasteButtonLabel}
        </Button>
      </div>
    );
  }

  if (variant === "resendFlow") {
    return (
      <div className={cn("flex flex-col gap-3", containerClassName)}>
        {otpInput}
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0"
          disabled={!canResend}
          onClick={() => void handleResend()}
        >
          {canResend ? resendLabel : `Resend in ${secondsLeft}s`}
          {isResending ? "…" : null}
        </Button>
      </div>
    );
  }

  return <div className={containerClassName}>{otpInput}</div>;
}
