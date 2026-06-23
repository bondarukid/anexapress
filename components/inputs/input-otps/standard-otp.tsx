"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import type { StandardOtpProps } from "@/components/inputs/input-otps/types";
import { DEFAULT_OTP_LENGTH } from "@/components/inputs/input-otps/types/otp.types";
import { OtpInputCore } from "@/components/inputs/input-otps/utils/otp-slots";
import { useControllableOtp } from "@/components/inputs/input-otps/utils/use-controllable-otp";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Standard OTP input covering Kibo UI standard patterns.
 * https://www.kibo-ui.com/patterns/input-otp/standard
 */
export function StandardOtp({
  variant = "standard",
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
  patternHint = "Enter digits only",
  errorMessage,
  showValueDisplay,
  className,
  ...rest
}: StandardOtpProps) {
  const { value, setValue } = useControllableOtp({
    value: valueProp,
    defaultValue,
    onValueChange,
    maxLength,
  });

  const resolvedPattern = pattern ?? (variant === "patternValidation" ? REGEXP_ONLY_DIGITS : undefined);
  const resolvedSeparators =
    separatorPositions ??
    (variant === "multipleSeparators" ? [Math.floor(maxLength / 2)] : undefined);
  const isInvalid = variant === "formValidation" && Boolean(errorMessage);
  const shouldShowValue = variant === "controlled" || showValueDisplay;

  const otpField = (
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
      separatorPositions={resolvedSeparators}
      aria-invalid={isInvalid}
      className={className}
      {...rest}
    />
  );

  if (variant === "formValidation") {
    return (
      <Field className={containerClassName} data-invalid={isInvalid}>
        {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        {otpField}
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      </Field>
    );
  }

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
      {variant === "patternValidation" && patternHint ? (
        <p className="text-muted-foreground text-xs">{patternHint}</p>
      ) : null}
      {otpField}
      {shouldShowValue ? (
        <p className="text-muted-foreground text-xs tabular-nums">
          Value: {value || "—"}
        </p>
      ) : null}
    </div>
  );
}
