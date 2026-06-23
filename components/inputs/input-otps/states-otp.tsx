"use client";

import { CircleCheckIcon } from "lucide-react";

import type { StatesOtpProps } from "@/components/inputs/input-otps/types";
import { DEFAULT_OTP_LENGTH } from "@/components/inputs/input-otps/types/otp.types";
import { OtpInputCore } from "@/components/inputs/input-otps/utils/otp-slots";
import { useControllableOtp } from "@/components/inputs/input-otps/utils/use-controllable-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Stateful OTP input covering Kibo UI states: disabled, loading, error, success.
 * https://www.kibo-ui.com/patterns/input-otp/states
 */
export function StatesOtp({
  variant = "disabled",
  value: valueProp,
  defaultValue,
  onValueChange,
  maxLength = DEFAULT_OTP_LENGTH,
  pattern,
  disabled: disabledProp,
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
  isLoading: isLoadingProp,
  loadingMessage = "Verifying code…",
  errorMessage,
  successMessage,
  className,
  ...rest
}: StatesOtpProps) {
  const { value, setValue } = useControllableOtp({
    value: valueProp,
    defaultValue,
    onValueChange,
    maxLength,
  });

  const isDisabled = disabledProp ?? variant === "disabled";
  const isLoading = isLoadingProp ?? variant === "loading";
  const isError = variant === "error";
  const isSuccess = variant === "success";

  const statusMessage = isLoading
    ? loadingMessage
    : isError
      ? errorMessage
      : isSuccess
        ? successMessage
        : undefined;

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label ? (
        <Label htmlFor={id} className={cn("text-sm", isDisabled && "opacity-50")}>
          {label}
        </Label>
      ) : null}
      {description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
      ) : null}
      <div className="relative">
        <OtpInputCore
          id={id}
          value={value}
          onChange={setValue}
          onComplete={onComplete}
          maxLength={maxLength}
          pattern={pattern}
          disabled={isDisabled || isLoading}
          pasteTransformer={pasteTransformer}
          inputRef={inputRef}
          groupClassName={groupClassName}
          slotClassName={slotClassName}
          separatorPositions={separatorPositions}
          aria-invalid={isError}
          success={isSuccess}
          className={className}
          {...rest}
        />
        {isLoading ? (
          <div className="bg-background/60 absolute inset-0 flex items-center justify-center rounded-lg">
            <Spinner className="size-4" />
          </div>
        ) : null}
      </div>
      {statusMessage ? (
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isError && "text-destructive",
            isSuccess && "text-success",
            isLoading && "text-muted-foreground",
          )}
        >
          {isSuccess ? <CircleCheckIcon className="size-3.5" /> : null}
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
