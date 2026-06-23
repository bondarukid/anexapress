import type { ReactNode } from "react";

export type FormAlertInputField = {
  type: "input";
  id: string;
  label: ReactNode;
  placeholder?: string;
  defaultValue?: string;
  inputType?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
};

export type FormAlertTextareaField = {
  type: "textarea";
  id: string;
  label: string;
  placeholder?: string;
  minHeight?: string;
  defaultValue?: string;
};

export type FormAlertSelectOption = {
  value: string;
  label: string;
};

export type FormAlertSelectField = {
  type: "select";
  id: string;
  label: string;
  options: FormAlertSelectOption[];
  defaultValue?: string;
  placeholder?: string;
};

export type FormAlertRadioOption = {
  id: string;
  value: string;
  label: string;
  description?: string;
};

export type FormAlertRadioField = {
  type: "radio";
  defaultValue?: string;
  options: FormAlertRadioOption[];
};

export type FormAlertCheckboxOption = {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
};

export type FormAlertCheckboxField = {
  type: "checkbox";
  options: FormAlertCheckboxOption[];
};

export type FormAlertField =
  | FormAlertInputField
  | FormAlertTextareaField
  | FormAlertSelectField
  | FormAlertRadioField
  | FormAlertCheckboxField;

export type FormAlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  cancelLabel?: string;
  submitLabel?: string;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  submitClassName?: string;
  cancelDisabled?: boolean;
  formClassName?: string;
  headerClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  children?: ReactNode;
  fields?: FormAlertField[];
};
