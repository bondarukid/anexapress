"use client";

import { isValidElement, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type {
  FormAlertField,
  FormAlertDialogProps,
} from "@/components/alert-dialogs/types/form-alert-dialog.types";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

function isStackedFormLayout(fields: FormAlertField[]) {
  if (fields.length !== 1) {
    return true;
  }

  const field = fields[0];
  return field.type === "radio" || field.type === "checkbox";
}

function getDefaultFormClassName(fields: FormAlertField[]) {
  return isStackedFormLayout(fields) ? "space-y-4 py-4" : "py-4";
}

function renderField(field: FormAlertField, stacked: boolean) {
  if (field.type === "input") {
    return (
      <Field
        key={field.id}
        data-invalid={field.invalid || undefined}
        className={stacked ? undefined : "gap-0"}
      >
        <FieldLabel htmlFor={field.id} id={getFieldLabelId(field.id)}>
          {field.label}
        </FieldLabel>
        <Input
          id={field.id}
          type={field.inputType}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          className={cn(
            !stacked && "mt-2",
            field.invalid && "border-destructive focus-visible:ring-destructive",
          )}
          aria-invalid={field.invalid}
        />
        {field.hint ? <FieldDescription className="text-xs">{field.hint}</FieldDescription> : null}
        {field.error ? <FieldError>{field.error}</FieldError> : null}
      </Field>
    );
  }

  if (field.type === "textarea") {
    return (
      <Field key={field.id}>
        <FieldLabel htmlFor={field.id} id={getFieldLabelId(field.id)}>
          {field.label}
        </FieldLabel>
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          className={field.minHeight ?? "min-h-[100px]"}
        />
      </Field>
    );
  }

  if (field.type === "select") {
    return (
      <Field key={field.id}>
        <FieldLabel htmlFor={field.id} id={getFieldLabelId(field.id)}>
          {field.label}
        </FieldLabel>
        <Select defaultValue={field.defaultValue}>
          <SelectTrigger id={field.id}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  }

  if (field.type === "radio") {
    return (
      <RadioGroup key="radio-group" defaultValue={field.defaultValue}>
        {field.options.map((option) => (
          <Field
            key={option.id}
            orientation="horizontal"
            className="rounded-lg border p-3 hover:bg-accent"
          >
            <RadioGroupItem id={option.id} value={option.value} />
            <FieldContent>
              <FieldLabel className="flex-1 cursor-pointer font-medium" htmlFor={option.id}>
                {option.label}
              </FieldLabel>
              {option.description ? (
                <FieldDescription className="text-xs">{option.description}</FieldDescription>
              ) : null}
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    );
  }

  return (
    <FieldGroup key="checkbox-group" className="gap-4">
      {field.options.map((option) => (
        <Field key={option.id} orientation="horizontal" className="items-start gap-3">
          <Checkbox id={option.id} defaultChecked={option.defaultChecked} />
          <FieldContent>
            <FieldLabel className="font-medium" htmlFor={option.id}>
              {option.label}
            </FieldLabel>
            {option.description ? (
              <FieldDescription>{option.description}</FieldDescription>
            ) : null}
          </FieldContent>
        </Field>
      ))}
    </FieldGroup>
  );
}

function renderFields(fields: FormAlertField[]) {
  const stacked = isStackedFormLayout(fields);

  if (stacked && fields.length > 1) {
    return <FieldGroup>{fields.map((field) => renderField(field, stacked))}</FieldGroup>;
  }

  return fields.map((field) => renderField(field, stacked));
}

/**
 * Configurable form alert dialog covering Kibo UI form-1…7.
 *
 * @example Pattern 1 — single input
 * ```tsx
 * <FormAlertDialog
 *   trigger={<Button variant="outline">Rename</Button>}
 *   title="Rename Workspace"
 *   description="Enter a new name for your workspace."
 *   fields={[{ type: "input", id: "name", label: "Workspace name", defaultValue: "Untitled workspace" }]}
 *   submitLabel="Save"
 * />
 * ```
 *
 * @example Pattern 2 — multiple inputs
 * ```tsx
 * <FormAlertDialog
 *   title="Send Feedback"
 *   fields={[
 *     { type: "input", id: "subject", label: "Subject" },
 *     { type: "textarea", id: "message", label: "Message" },
 *   ]}
 *   submitLabel="Send"
 * />
 * ```
 *
 * @example Pattern 5 — validation state
 * ```tsx
 * <FormAlertDialog
 *   title="Transfer Workspace"
 *   fields={[{
 *     type: "input",
 *     id: "confirm-name",
 *     label: <>Workspace name: <span className="font-mono">acme-sustainability</span></>,
 *     invalid: true,
 *     error: "Workspace name does not match",
 *   }]}
 *   submitLabel="Transfer"
 *   submitDisabled
 * />
 * ```
 */
export function FormAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  onSubmit,
  onCancel,
  submitDisabled = false,
  submitLoading = false,
  submitClassName,
  cancelDisabled = false,
  formClassName,
  headerClassName,
  descriptionClassName,
  contentClassName,
  children,
  fields,
}: FormAlertDialogProps) {
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormKey((currentKey) => currentKey + 1);
    }
    onOpenChange?.(nextOpen);
  };

  const isSubmitDisabled = submitDisabled || submitLoading;

  const renderDescription = () => {
    if (!description) {
      return null;
    }

    if (typeof description === "string") {
      return (
        <AlertDialogDescription className={descriptionClassName}>
          {description}
        </AlertDialogDescription>
      );
    }

    if (isValidElement(description)) {
      return (
        <AlertDialogDescription asChild className={descriptionClassName}>
          {description}
        </AlertDialogDescription>
      );
    }

    return (
      <AlertDialogDescription className={descriptionClassName}>
        {description}
      </AlertDialogDescription>
    );
  };

  const renderFormContent = () => {
    if (children) {
      return <div key={formKey}>{children}</div>;
    }

    if (!fields || fields.length === 0) {
      return null;
    }

    return (
      <div
        key={formKey}
        className={cn(formClassName ?? getDefaultFormClassName(fields))}
      >
        {renderFields(fields)}
      </div>
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}

      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader className={headerClassName}>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {renderDescription()}
        </AlertDialogHeader>

        {renderFormContent()}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelDisabled} onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitDisabled}
            className={submitClassName}
            onClick={onSubmit}
          >
            <span className="inline-flex items-center gap-2">
              {submitLoading ? <Spinner className="size-4" /> : null}
              {submitLabel}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
