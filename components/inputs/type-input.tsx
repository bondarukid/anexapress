"use client";

import {
  Calendar,
  Eye,
  EyeOff,
  Link,
  Mail,
  Minus,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import type { TypeInputProps } from "@/components/inputs/types";
import { IconInputGroup } from "@/components/inputs/utils/icon-input-group";
import { InputFieldShell } from "@/components/inputs/utils/input-field-shell";
import { useControllableInput } from "@/components/inputs/utils/use-controllable-input";
import { cn } from "@/lib/utils";

const VARIANT_ICONS = {
  email: Mail,
  search: Search,
  date: Calendar,
  phone: Phone,
  url: Link,
} as const;

/**
 * Type input covering Kibo UI types-1…7 patterns.
 * https://www.kibo-ui.com/patterns/input/types
 */
export function TypeInput({
  variant = "email",
  id = "input",
  label,
  placeholder,
  value: valueProp,
  defaultValue,
  onChange,
  disabled,
  helperText,
  icon: IconProp,
  min = 1,
  max,
  step,
  className,
  containerClassName,
  inputClassName,
  inputProps,
}: TypeInputProps) {
  const { value, setValue } = useControllableInput({
    value: valueProp,
    defaultValue,
    onChange,
  });

  const [showPassword, setShowPassword] = useState(false);
  const labelId = label ? getFieldLabelId(id) : undefined;

  if (variant === "passwordToggle") {
    return (
      <InputFieldShell containerClassName={containerClassName} id={id} label={label}>
        <div className="relative">
          <Input
            aria-label={!labelId && placeholder ? placeholder : undefined}
            aria-labelledby={labelId}
            className={cn("bg-background", inputClassName, className)}
            disabled={disabled}
            id={id}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            type={showPassword ? "text" : "password"}
            value={value}
            {...inputProps}
          />
          <Button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword((current) => !current)}
            size="icon"
            type="button"
            variant="ghost"
          >
            {showPassword ? (
              <EyeOff className="size-4 text-muted-foreground" data-icon="inline-start" />
            ) : (
              <Eye className="size-4 text-muted-foreground" data-icon="inline-start" />
            )}
          </Button>
        </div>
      </InputFieldShell>
    );
  }

  if (variant === "numberControls") {
    const numericValue = Number(value) || min;

    return (
      <InputFieldShell containerClassName={containerClassName} id={id} label={label}>
        <div className="flex gap-2">
          <Button
            aria-label="Decrease value"
            onClick={() => setValue(String(Math.max(min, numericValue - 1)))}
            size="icon"
            type="button"
            variant="outline"
          >
            <Minus className="size-4" data-icon="inline-start" />
          </Button>
          <Input
            aria-label={!labelId && placeholder ? placeholder : undefined}
            aria-labelledby={labelId}
            className={cn("bg-background text-center", inputClassName, className)}
            disabled={disabled}
            id={id}
            min={min}
            max={max}
            onChange={(event) => setValue(event.target.value)}
            step={step}
            type="number"
            value={numericValue}
            {...inputProps}
          />
          <Button
            aria-label="Increase value"
            onClick={() => setValue(String(numericValue + 1))}
            size="icon"
            type="button"
            variant="outline"
          >
            <Plus className="size-4" data-icon="inline-start" />
          </Button>
        </div>
      </InputFieldShell>
    );
  }

  const iconVariant = variant as keyof typeof VARIANT_ICONS;
  const Icon = IconProp ?? VARIANT_ICONS[iconVariant];
  const inputType =
    variant === "email"
      ? "email"
      : variant === "search"
        ? "search"
        : variant === "date"
          ? "date"
          : variant === "phone"
            ? "tel"
            : "url";

  return (
    <InputFieldShell
      containerClassName={containerClassName}
      helperText={helperText}
      id={id}
      label={label}
    >
      <IconInputGroup
        className={className}
        disabled={disabled}
        icon={Icon}
        id={id}
        inputClassName={inputClassName}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        type={inputType}
        value={value}
        {...inputProps}
      />
    </InputFieldShell>
  );
}
