"use client";

import { isValidElement } from "react";
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
import type { ConfirmationAlertDialogProps } from "@/components/alert-dialogs/types/confirmation-alert-dialog.types";
import { cn } from "@/lib/utils";

/**
 * Configurable confirmation alert dialog covering Kibo UI confirmation-1…6.
 * https://www.kibo-ui.com/patterns/alert-dialog/confirmation/alert-dialog-confirmation-1
 */
export function ConfirmationAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  badge,
  icon: Icon,
  iconLayout = "none",
  iconClassName,
  cancelLabel = "Cancel",
  confirmLabel = "Continue",
  onConfirm,
  onCancel,
  confirmVariant = "default",
  confirmClassName,
  cancelDisabled = false,
  confirmDisabled = false,
  headerClassName,
  descriptionClassName,
  contentClassName,
}: ConfirmationAlertDialogProps) {
  const showInlineIcon = Boolean(Icon) && iconLayout === "inline";
  const showCenteredIcon = Boolean(Icon) && iconLayout === "centered";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}

      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader
          className={cn(showCenteredIcon && "items-center", headerClassName)}
        >
          {showCenteredIcon && Icon ? (
            <AlertDialogMedia>
              <Icon className={iconClassName} />
            </AlertDialogMedia>
          ) : null}

          {showInlineIcon && Icon ? (
            <div className="flex items-center gap-2">
              <Icon className={cn("size-5", iconClassName)} />
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

          {description ? (
            typeof description === "string" ? (
              <AlertDialogDescription className={descriptionClassName}>
                {description}
              </AlertDialogDescription>
            ) : isValidElement(description) ? (
              <AlertDialogDescription asChild className={descriptionClassName}>
                {description}
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription className={descriptionClassName}>
                {description}
              </AlertDialogDescription>
            )
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelDisabled} onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            disabled={confirmDisabled}
            className={confirmClassName}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
