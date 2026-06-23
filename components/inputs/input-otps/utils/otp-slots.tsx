"use client";

import * as React from "react";
import { OTPInputContext } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { BaseOtpProps } from "@/components/inputs/input-otps/types/otp.types";
import { cn } from "@/lib/utils";

type OtpSlotsProps = Pick<
  BaseOtpProps,
  | "groupClassName"
  | "slotClassName"
  | "separatorPositions"
  | "masked"
  | "revealOnFocus"
  | "aria-invalid"
> & {
  maxLength: number;
  stretch?: boolean;
  success?: boolean;
};

function MaskedOtpSlot({
  index,
  className,
  revealOnFocus = false,
}: {
  index: number;
  className?: string;
  revealOnFocus?: boolean;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  const displayChar = char && (!revealOnFocus || !isActive) ? "•" : char;

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "border-input aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 relative flex size-8 items-center justify-center border-y border-r text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:ring-3",
        className,
      )}
    >
      {displayChar}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders OTP slots with optional separators and masking.
 */
export function OtpSlots({
  maxLength,
  groupClassName,
  slotClassName,
  separatorPositions = [],
  masked = false,
  revealOnFocus = false,
  stretch = false,
  success = false,
  "aria-invalid": ariaInvalid,
}: OtpSlotsProps) {
  const separatorSet = new Set(separatorPositions);

  return (
    <InputOTPGroup
      aria-invalid={ariaInvalid}
      data-state={success ? "success" : undefined}
      className={cn(
        stretch && "w-full justify-between gap-1.5",
        success && "border-success/80 ring-success/20",
        groupClassName,
      )}
    >
      {Array.from({ length: maxLength }).map((_, index) => (
        <React.Fragment key={index}>
          {masked ? (
            <MaskedOtpSlot
              index={index}
              className={cn(stretch && "size-10 flex-1 text-base font-medium sm:size-11", slotClassName)}
              revealOnFocus={revealOnFocus}
            />
          ) : (
            <InputOTPSlot
              index={index}
              className={cn(stretch && "size-10 flex-1 text-base font-medium sm:size-11", slotClassName)}
            />
          )}
          {separatorSet.has(index + 1) && index < maxLength - 1 ? <InputOTPSeparator /> : null}
        </React.Fragment>
      ))}
    </InputOTPGroup>
  );
}

type OtpInputCoreProps = BaseOtpProps & {
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  stretch?: boolean;
  success?: boolean;
  children?: React.ReactNode;
};

/**
 * Shared InputOTP wrapper used by all category components.
 */
export function OtpInputCore({
  id,
  value,
  onChange,
  onComplete,
  maxLength,
  pattern,
  disabled,
  pasteTransformer,
  inputRef,
  containerClassName,
  className,
  autoFocus,
  autoComplete,
  inputMode,
  stretch,
  success,
  groupClassName,
  slotClassName,
  separatorPositions,
  masked,
  revealOnFocus,
  "aria-invalid": ariaInvalid,
  children,
  ...rest
}: OtpInputCoreProps) {
  return (
    <InputOTP
      id={id}
      ref={inputRef}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      pattern={pattern}
      disabled={disabled}
      pasteTransformer={pasteTransformer}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      inputMode={inputMode}
      containerClassName={containerClassName}
      className={className}
      {...rest}
    >
      {children ?? (
        <OtpSlots
          maxLength={maxLength}
          groupClassName={groupClassName}
          slotClassName={slotClassName}
          separatorPositions={separatorPositions}
          masked={masked}
          revealOnFocus={revealOnFocus}
          stretch={stretch}
          success={success}
          aria-invalid={ariaInvalid}
        />
      )}
    </InputOTP>
  );
}
