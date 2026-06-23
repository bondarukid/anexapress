"use client";

import { LoaderIcon } from "lucide-react";

import {
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import type { SpinnerInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  toInputGroupInputControlProps,
  toInputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/utils/input-group-props";
import {
  InputGroupBlockEndAddon,
  InputGroupInlineEndAddon,
  InputGroupInlineStartAddon,
  InputGroupShell,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import { cn } from "@/lib/utils";

/**
 * Configurable spinner input group covering Kibo UI input-group-spinner-1…4.
 * https://www.kibo-ui.com/patterns/input-group/spinner
 */
export function SpinnerInputGroup({
  variant = "loadingStates",
  placeholder,
  className,
  containerClassName,
  textareaClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  isLoading = true,
  loadingText = "Saving...",
  ...controlProps
}: SpinnerInputGroupProps) {
  const loadingDisabled = disabled ?? isLoading;

  const inputProps = {
    ...toInputGroupInputControlProps(controlProps),
    "aria-invalid": ariaInvalid,
    disabled: loadingDisabled,
    id,
  };

  const textareaProps = {
    ...toInputGroupTextareaControlProps(controlProps),
    "aria-invalid": ariaInvalid,
    disabled: loadingDisabled,
    id,
  };

  if (variant === "spinnerText") {
    return (
      <InputGroupShell
        className={className}
        containerClassName={containerClassName}
        data-disabled={isLoading ? true : undefined}
      >
        <InputGroupInput
          {...inputProps}
          placeholder={placeholder ?? "Saving changes..."}
        />
        <InputGroupInlineEndAddon>
          <InputGroupText>{loadingText}</InputGroupText>
          <Spinner />
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "animatedIcon") {
    return (
      <InputGroupShell
        className={className}
        containerClassName={containerClassName}
        data-disabled={isLoading ? true : undefined}
      >
        <InputGroupInput
          {...inputProps}
          placeholder={placeholder ?? "Refreshing data..."}
        />
        <InputGroupInlineStartAddon>
          <LoaderIcon className="animate-spin" />
        </InputGroupInlineStartAddon>
        <InputGroupInlineEndAddon>
          <InputGroupText className="text-muted-foreground">Please wait...</InputGroupText>
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "textareaLoading") {
    return (
      <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
        <InputGroupShell
          className={className}
          data-disabled={isLoading ? true : undefined}
          maxWidthClassName="max-w-none"
        >
          <InputGroupTextarea
            {...textareaProps}
            className={cn("min-h-[100px]", textareaClassName)}
            placeholder={placeholder ?? "Generating content..."}
          />
          <InputGroupBlockEndAddon className="border-t">
            <Spinner />
          </InputGroupBlockEndAddon>
        </InputGroupShell>
        <InputGroupShell
          className={className}
          data-disabled={isLoading ? true : undefined}
          maxWidthClassName="max-w-none"
        >
          <InputGroupInput
            {...inputProps}
            placeholder="Uploading file..."
          />
          <InputGroupInlineEndAddon>
            <Spinner />
          </InputGroupInlineEndAddon>
        </InputGroupShell>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
      <InputGroupShell
        className={className}
        data-disabled={isLoading ? true : undefined}
        maxWidthClassName="max-w-none"
      >
        <InputGroupInput
          {...inputProps}
          placeholder={placeholder ?? "Searching..."}
        />
        <InputGroupInlineEndAddon>
          <Spinner />
        </InputGroupInlineEndAddon>
      </InputGroupShell>
      <InputGroupShell
        className={className}
        data-disabled={isLoading ? true : undefined}
        maxWidthClassName="max-w-none"
      >
        <InputGroupInput {...inputProps} placeholder="Processing..." />
        <InputGroupInlineStartAddon>
          <Spinner />
        </InputGroupInlineStartAddon>
      </InputGroupShell>
    </div>
  );
}
