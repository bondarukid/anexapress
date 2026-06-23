"use client";

import { Input } from "@/components/ui/input";
import type { ValidationInputProps } from "@/components/inputs/types";
import { InputFieldShell } from "@/components/inputs/utils/input-field-shell";
import { useControllableInput } from "@/components/inputs/utils/use-controllable-input";
import {
  RealtimeValidationList,
  VALIDATION_INPUT_CLASSNAMES,
  ValidationMessage,
  ValidationMessageList,
} from "@/components/inputs/utils/validation-message";
import { cn } from "@/lib/utils";

/**
 * Validation input covering Kibo UI validation-1…5 patterns.
 * https://www.kibo-ui.com/patterns/input/validation
 */
export function ValidationInput({
  variant = "error",
  id = "input",
  label,
  placeholder,
  value: valueProp,
  defaultValue,
  onChange,
  disabled,
  message,
  messages = [],
  rules = [],
  className,
  containerClassName,
  inputClassName,
  inputProps,
}: ValidationInputProps) {
  const { value, setValue } = useControllableInput({
    value: valueProp,
    defaultValue,
    onChange,
  });

  const isErrorVariant = variant === "error" || variant === "multipleMessages";
  const isSuccessVariant = variant === "success";
  const isWarningVariant = variant === "warning";

  const validationClassName = isSuccessVariant
    ? VALIDATION_INPUT_CLASSNAMES.success
    : isWarningVariant
      ? VALIDATION_INPUT_CLASSNAMES.warning
      : undefined;

  const resolvedRules =
    variant === "realtimeValidation"
      ? rules.map((rule) => ({
          text: rule.text,
          valid: rule.validate(value),
        }))
      : [];

  return (
    <InputFieldShell
      containerClassName={containerClassName}
      id={id}
      invalid={isErrorVariant}
      label={label}
    >
      <Input
        aria-invalid={isErrorVariant || undefined}
        className={cn("bg-background", validationClassName, inputClassName, className)}
        disabled={disabled}
        id={id}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        value={value}
        {...inputProps}
      />

      {variant === "error" && message ? (
        <ValidationMessage message={message} status="error" />
      ) : null}

      {variant === "success" && message ? (
        <ValidationMessage message={message} status="success" />
      ) : null}

      {variant === "warning" && message ? (
        <ValidationMessage message={message} status="warning" />
      ) : null}

      {variant === "multipleMessages" && messages.length > 0 ? (
        <ValidationMessageList messages={messages} status="error" />
      ) : null}

      {variant === "realtimeValidation" && resolvedRules.length > 0 ? (
        <RealtimeValidationList rules={resolvedRules} />
      ) : null}
    </InputFieldShell>
  );
}
