import type { ComponentProps } from "react";

import { getFieldLabelId } from "@/lib/ui/field-a11y";
import type {
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import type {
  InputGroupInputControlProps,
  InputGroupMixedControlProps,
  InputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

type InputElementProps = ComponentProps<typeof InputGroupInput>;
type TextareaElementProps = ComponentProps<typeof InputGroupTextarea>;

/**
 * Returns aria props for input-group controls when a visible label is present.
 */
export function getInputGroupA11yProps(
  id: string | undefined,
  label: string | undefined,
  placeholder: string | undefined,
) {
  const labelId = label && id ? getFieldLabelId(id) : undefined;

  return {
    "aria-label": !labelId && placeholder ? placeholder : undefined,
    "aria-labelledby": labelId,
  };
}

/**
 * Strips textarea-only fields before spreading mixed control props onto inputs.
 */
export function toInputGroupInputControlProps(
  props: InputGroupMixedControlProps
): InputGroupInputControlProps {
  const { rows: _rows, onChange, ...rest } = props;

  return {
    ...rest,
    onChange: onChange as InputElementProps["onChange"],
  };
}

/**
 * Normalizes mixed control props for textarea elements.
 */
export function toInputGroupTextareaControlProps(
  props: InputGroupMixedControlProps
): InputGroupTextareaControlProps {
  const { onChange, ...rest } = props;

  return {
    ...rest,
    onChange: onChange as TextareaElementProps["onChange"],
  };
}
