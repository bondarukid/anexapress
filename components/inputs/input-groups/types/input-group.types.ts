import type { ComponentProps, ReactNode } from "react";

import type {
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";

/**
 * Shared props for all Kibo UI input-group category components.
 */
export type BaseInputGroupProps = {
  className?: string;
  containerClassName?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export type InputGroupInputControlProps = Pick<
  ComponentProps<typeof InputGroupInput>,
  "value" | "defaultValue" | "onChange" | "name" | "readOnly"
>;

export type InputGroupTextareaControlProps = Pick<
  ComponentProps<typeof InputGroupTextarea>,
  "value" | "defaultValue" | "onChange" | "name" | "readOnly" | "rows"
>;

/** @deprecated Prefer {@link InputGroupInputControlProps} or {@link InputGroupTextareaControlProps}. */
export type InputGroupControlProps = InputGroupInputControlProps;

export type InputGroupMixedControlProps = Omit<
  InputGroupInputControlProps & InputGroupTextareaControlProps,
  "onChange"
> & {
  onChange?:
    | InputGroupInputControlProps["onChange"]
    | InputGroupTextareaControlProps["onChange"];
};

export type InputGroupMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
};

export type InputGroupCountProps = {
  currentCount?: number;
  maxCount?: number;
  countLabel?: string;
};
