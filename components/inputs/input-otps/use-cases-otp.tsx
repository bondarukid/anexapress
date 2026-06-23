"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { BehaviorOtp } from "@/components/inputs/input-otps/behavior-otp";
import type { UseCasesOtpProps } from "@/components/inputs/input-otps/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const USE_CASE_DEFAULTS = {
  emailVerification: {
    maxLength: 6,
    label: "Verification code",
    description: "Enter the code sent to your email.",
    behaviorVariant: "resendFlow" as const,
    resendCooldownSeconds: 60,
  },
  twoFactorAuth: {
    maxLength: 6,
    label: "Authentication code",
    description: "Enter the 6-digit code from your authenticator app.",
    behaviorVariant: "autoSubmit" as const,
    pattern: REGEXP_ONLY_DIGITS,
    inputMode: "numeric" as const,
  },
  smsVerification: {
    maxLength: 6,
    label: "SMS code",
    description: "Enter the code from your text message.",
    behaviorVariant: "pasteOptimization" as const,
    autoComplete: "one-time-code",
  },
  transactionConfirmation: {
    maxLength: 4,
    label: "Confirm transaction",
    description: "Enter your 4-digit confirmation PIN.",
    behaviorVariant: "enhancedFocus" as const,
    inputMode: "numeric" as const,
  },
} as const;

/**
 * Use-case OTP flows covering Kibo UI use-case patterns.
 * https://www.kibo-ui.com/patterns/input-otp/use-cases
 */
export function UseCasesOtp({
  variant = "emailVerification",
  confirmLabel = "Confirm",
  onConfirm,
  containerClassName,
  ...rest
}: UseCasesOtpProps) {
  const defaults = USE_CASE_DEFAULTS[variant];

  const behaviorVariant = defaults.behaviorVariant;

  return (
    <div className={cn("flex flex-col gap-4", containerClassName)}>
      <BehaviorOtp
        variant={behaviorVariant}
        maxLength={defaults.maxLength}
        label={rest.label ?? defaults.label}
        description={rest.description ?? defaults.description}
        pattern={rest.pattern ?? ("pattern" in defaults ? defaults.pattern : undefined)}
        inputMode={rest.inputMode ?? ("inputMode" in defaults ? defaults.inputMode : undefined)}
        autoComplete={
          rest.autoComplete ?? ("autoComplete" in defaults ? defaults.autoComplete : undefined)
        }
        resendCooldownSeconds={
          rest.resendCooldownSeconds ??
          ("resendCooldownSeconds" in defaults ? defaults.resendCooldownSeconds : undefined)
        }
        onAutoSubmit={variant === "twoFactorAuth" ? rest.onAutoSubmit : undefined}
        {...rest}
      />
      {variant === "transactionConfirmation" && onConfirm ? (
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            if (rest.value) {
              onConfirm(rest.value);
            }
          }}
          disabled={!rest.value || rest.value.length < defaults.maxLength}
        >
          {confirmLabel}
        </Button>
      ) : null}
    </div>
  );
}
