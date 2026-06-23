"use client";

import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import type { VariantsOtpProps } from "@/components/inputs/input-otps/types";
import { DEFAULT_OTP_LENGTH } from "@/components/inputs/input-otps/types/otp.types";
import { OtpInputCore } from "@/components/inputs/input-otps/utils/otp-slots";
import { useControllableOtp } from "@/components/inputs/input-otps/utils/use-controllable-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Variant OTP input covering Kibo UI variants: numericOnly, masked, differentLength.
 * https://www.kibo-ui.com/patterns/input-otp/variants
 */
export function VariantsOtp({
  variant = "numericOnly",
  value: valueProp,
  defaultValue,
  onValueChange,
  maxLength = DEFAULT_OTP_LENGTH,
  pattern,
  disabled,
  id = "otp-input",
  label,
  description,
  containerClassName,
  groupClassName,
  slotClassName,
  separatorPositions,
  onComplete,
  pasteTransformer,
  inputRef,
  revealOnFocus = false,
  className,
  stretch,
  ...rest
}: VariantsOtpProps) {
  const { value, setValue } = useControllableOtp({
    value: valueProp,
    defaultValue,
    onValueChange,
    maxLength,
  });

  const resolvedPattern =
    pattern ??
    (variant === "numericOnly"
      ? REGEXP_ONLY_DIGITS
      : variant === "differentLength"
        ? REGEXP_ONLY_DIGITS_AND_CHARS
        : undefined);

  const resolvedInputMode = variant === "numericOnly" ? "numeric" : rest.inputMode;
  const isMasked = variant === "masked";

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label ? (
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
      ) : null}
      {description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
      ) : null}
      <OtpInputCore
        id={id}
        value={value}
        onChange={setValue}
        onComplete={onComplete}
        maxLength={maxLength}
        pattern={resolvedPattern}
        disabled={disabled}
        pasteTransformer={pasteTransformer}
        inputRef={inputRef}
        groupClassName={groupClassName}
        slotClassName={slotClassName}
        separatorPositions={separatorPositions}
        masked={isMasked}
        revealOnFocus={revealOnFocus}
        stretch={stretch ?? variant === "differentLength"}
        inputMode={resolvedInputMode}
        className={className}
        {...rest}
      />
    </div>
  );
}
