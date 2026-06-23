"use client";

import { DollarSign, Clock } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import type { SpecialInputProps } from "@/components/inputs/types";
import { FileUploadList } from "@/components/inputs/utils/file-upload-list";
import { IconInputGroup } from "@/components/inputs/utils/icon-input-group";
import { InputFieldShell } from "@/components/inputs/utils/input-field-shell";
import { useControllableInput } from "@/components/inputs/utils/use-controllable-input";
import { cn } from "@/lib/utils";

/**
 * Special input covering Kibo UI special-1…5 patterns.
 * https://www.kibo-ui.com/patterns/input/special
 */
export function SpecialInput({
  variant = "fileUploadList",
  id = "input",
  label,
  placeholder,
  value: valueProp,
  defaultValue,
  onChange,
  disabled,
  description,
  helperText,
  icon: IconProp,
  min = 0,
  max = 100,
  step = 0.01,
  multiple = true,
  accept,
  rangeMinLabel = "0%",
  rangeMaxLabel = "100%",
  valueLabelFormatter = (value) => `${value}%`,
  onFilesChange,
  className,
  containerClassName,
  inputClassName,
  inputProps,
}: SpecialInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { value, setValue } = useControllableInput({
    value: valueProp,
    defaultValue,
    onChange,
  });

  const numericValue = Number(value) || 0;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const nextFiles = Array.from(event.target.files);
    setFiles(nextFiles);
    onFilesChange?.(nextFiles);
  };

  const removeFile = (index: number) => {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(nextFiles);
    onFilesChange?.(nextFiles);
  };

  if (variant === "fileUploadList") {
    return (
      <InputFieldShell
        containerClassName={containerClassName}
        id={id}
        label={label}
      >
        <Input
          accept={accept}
          className={cn("bg-background", inputClassName, className)}
          disabled={disabled}
          id={id}
          multiple={multiple}
          onChange={handleFileChange}
          type="file"
          {...inputProps}
        />
        <FileUploadList files={files} onRemove={removeFile} />
      </InputFieldShell>
    );
  }

  if (variant === "timeInput") {
    const Icon = IconProp ?? Clock;
    return (
      <InputFieldShell
        containerClassName={containerClassName}
        id={id}
        label={label}
      >
        <IconInputGroup
          className={className}
          disabled={disabled}
          icon={Icon}
          id={id}
          inputClassName={inputClassName}
          type="time"
          {...inputProps}
        />
      </InputFieldShell>
    );
  }

  if (variant === "rangeWithValue") {
    return (
      <InputFieldShell
        containerClassName={containerClassName}
        headerTrailing={
          <span className="font-medium text-sm">{valueLabelFormatter(numericValue)}</span>
        }
        id={id}
        label={label}
      >
        <Input
          className={cn("cursor-pointer bg-background", inputClassName, className)}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onChange={(event) => setValue(event.target.value)}
          type="range"
          value={numericValue}
          {...inputProps}
        />
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>{rangeMinLabel}</span>
          <span>{rangeMaxLabel}</span>
        </div>
      </InputFieldShell>
    );
  }

  if (variant === "disabled") {
    return (
      <InputFieldShell
        containerClassName={containerClassName}
        helperText={helperText ?? "This field cannot be edited."}
        id={id}
        label={label}
      >
        <Input
          className={cn("bg-background", inputClassName, className)}
          disabled
          id={id}
          type="text"
          value={value}
          {...inputProps}
        />
      </InputFieldShell>
    );
  }

  const Icon = IconProp ?? DollarSign;

  return (
    <InputFieldShell
      containerClassName={containerClassName}
      description={description}
      helperText={helperText ?? "Enter amount in USD"}
      id={id}
      label={label}
    >
      <IconInputGroup
        className={className}
        disabled={disabled}
        icon={Icon}
        id={id}
        inputClassName={inputClassName}
        min={min}
        placeholder={placeholder ?? "0.00"}
        step={step}
        type="number"
        {...inputProps}
      />
    </InputFieldShell>
  );
}
