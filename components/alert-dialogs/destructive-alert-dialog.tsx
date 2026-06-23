"use client";

import { isValidElement, useId, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { DestructiveAlertDialogProps } from "@/components/alert-dialogs/types/destructive-alert-dialog.types";
import { cn } from "@/lib/utils";

/**
 * Configurable destructive alert dialog covering Kibo UI destructive-1…7.
 *
 * @example Pattern 1 — simple delete
 * ```tsx
 * <DestructiveAlertDialog
 *   trigger={<Button variant="destructive">Delete</Button>}
 *   title="Delete Item?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 * />
 * ```
 *
 * @example Pattern 3 — checkbox confirmation
 * ```tsx
 * <DestructiveAlertDialog
 *   title="Delete Account Permanently"
 *   icon={AlertTriangle}
 *   iconLayout="centered"
 *   iconVariant="destructiveCircle"
 *   headerClassName="items-center"
 *   descriptionClassName="text-center"
 *   confirmationCheckbox={{ label: "I understand this action is permanent" }}
 *   confirmLabel="Delete Account"
 * />
 * ```
 *
 * @example Pattern 4 — consequence details in body
 * ```tsx
 * <DestructiveAlertDialog
 *   title="Revoke API Access?"
 *   description="Revoking this API key will immediately:"
 *   body={
 *     <div className="rounded-md bg-destructive/10 p-4 text-sm">
 *       <ul className="list-inside list-disc space-y-1 text-destructive">...</ul>
 *     </div>
 *   }
 *   confirmLabel="Revoke Access"
 * />
 * ```
 */
export function DestructiveAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  badge,
  icon: Icon,
  iconLayout = "none",
  iconVariant = "default",
  iconClassName,
  body,
  confirmationCheckbox,
  confirmationChecked,
  onConfirmationCheckedChange,
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  confirmIcon: ConfirmIcon,
  onConfirm,
  onCancel,
  confirmClassName,
  cancelDisabled = false,
  confirmDisabled = false,
  confirmLoading = false,
  headerClassName,
  descriptionClassName,
  contentClassName,
}: DestructiveAlertDialogProps) {
  const generatedCheckboxId = useId();
  const checkboxId = confirmationCheckbox?.id ?? generatedCheckboxId;
  const [internalChecked, setInternalChecked] = useState(false);

  const isCheckboxControlled = confirmationChecked !== undefined;
  const isChecked = isCheckboxControlled ? confirmationChecked : internalChecked;

  const showInlineIcon = Boolean(Icon) && iconLayout === "inline";
  const showCenteredIcon = Boolean(Icon) && iconLayout === "centered";
  const showDestructiveCircle =
    showCenteredIcon && iconVariant === "destructiveCircle";

  const inlineIconClassName = cn("size-5", iconClassName ?? "text-destructive");

  const isConfirmDisabled =
    confirmDisabled ||
    confirmLoading ||
    (confirmationCheckbox !== undefined && !isChecked);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (!isCheckboxControlled) {
        setInternalChecked(false);
      }
      onConfirmationCheckedChange?.(false);
    }
    onOpenChange?.(nextOpen);
  };

  const handleCheckedChange = (checked: boolean | "indeterminate") => {
    const nextChecked = checked === true;
    if (!isCheckboxControlled) {
      setInternalChecked(nextChecked);
    }
    onConfirmationCheckedChange?.(nextChecked);
  };

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

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}

      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader
          className={cn(showCenteredIcon && "items-center", headerClassName)}
        >
          {showCenteredIcon && Icon && showDestructiveCircle ? (
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Icon className="size-6 text-red-600 dark:text-red-400" />
            </div>
          ) : null}

          {showCenteredIcon && Icon && !showDestructiveCircle ? (
            <AlertDialogMedia>
              <Icon className={iconClassName} />
            </AlertDialogMedia>
          ) : null}

          {showInlineIcon && Icon ? (
            <div className="flex items-center gap-2">
              <Icon className={inlineIconClassName} />
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          ) : (
            <AlertDialogTitle>{title}</AlertDialogTitle>
          )}

          {badge ? (
            <div className="bg-destructive/10 text-destructive inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {badge}
            </div>
          ) : null}

          {renderDescription()}
        </AlertDialogHeader>

        {body ? <div className="text-sm">{body}</div> : null}

        {confirmationCheckbox ? (
          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox
              id={checkboxId}
              checked={isChecked}
              onCheckedChange={handleCheckedChange}
            />
            <Label className="text-sm font-normal" htmlFor={checkboxId}>
              {confirmationCheckbox.label}
            </Label>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelDisabled} onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isConfirmDisabled}
            className={confirmClassName}
            onClick={onConfirm}
          >
            <span className="inline-flex items-center gap-2">
              {confirmLoading ? <Spinner className="size-4" /> : null}
              {ConfirmIcon && !confirmLoading ? <ConfirmIcon className="size-4" /> : null}
              {confirmLabel}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
