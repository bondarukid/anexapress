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
import { Spinner } from "@/components/ui/spinner";
import type { SuccessAlertDialogProps } from "@/components/alert-dialogs/types/success-alert-dialog.types";
import { cn } from "@/lib/utils";

/**
 * Configurable success alert dialog covering Kibo UI success-1…7.
 *
 * @example Pattern 1 — simple success
 * ```tsx
 * <SuccessAlertDialog
 *   trigger={<Button>Complete Action</Button>}
 *   title="Success!"
 *   description="Your changes have been saved successfully."
 *   actionLabel="Continue"
 * />
 * ```
 *
 * @example Pattern 3 — centered icon
 * ```tsx
 * <SuccessAlertDialog
 *   icon={CheckCircle2}
 *   iconLayout="centered"
 *   iconVariant="successCircle"
 *   headerClassName="items-center"
 *   title="Account Created!"
 *   descriptionClassName="text-center"
 *   actionLabel="Get Started"
 * />
 * ```
 *
 * @example Pattern 6 — dual action
 * ```tsx
 * <SuccessAlertDialog
 *   icon={CheckCircle2}
 *   iconLayout="centered"
 *   iconVariant="successCircle"
 *   headerClassName="items-center"
 *   title="Invitation Sent!"
 *   showCancel
 *   cancelLabel="Close"
 *   actionLabel="Invite Another"
 * />
 * ```
 */
export function SuccessAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  icon: Icon,
  iconLayout = "none",
  iconVariant = "default",
  iconClassName,
  body,
  showCancel = false,
  cancelLabel = "Close",
  actionLabel = "Continue",
  onAction,
  onCancel,
  actionLoading = false,
  actionDisabled = false,
  cancelDisabled = false,
  actionClassName,
  headerClassName,
  descriptionClassName,
  contentClassName,
}: SuccessAlertDialogProps) {
  const showInlineIcon = Boolean(Icon) && iconLayout === "inline";
  const showCenteredIcon = Boolean(Icon) && iconLayout === "centered";
  const showSuccessCircle = showCenteredIcon && iconVariant === "successCircle";
  const showCelebrationCircle =
    showCenteredIcon && iconVariant === "celebrationCircle";
  const showDefaultCenteredIcon =
    showCenteredIcon && !showSuccessCircle && !showCelebrationCircle;

  const inlineIconClassName = cn("size-5", iconClassName ?? "text-green-500");
  const isActionDisabled = actionDisabled || actionLoading;

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}

      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader
          className={cn(showCenteredIcon && "items-center", headerClassName)}
        >
          {showCenteredIcon && Icon && showSuccessCircle ? (
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Icon className="size-6 text-green-600 dark:text-green-400" />
            </div>
          ) : null}

          {showCenteredIcon && Icon && showCelebrationCircle ? (
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
              <Icon className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
          ) : null}

          {showCenteredIcon && Icon && showDefaultCenteredIcon ? (
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

          {renderDescription()}
        </AlertDialogHeader>

        {body ? <div className="text-sm">{body}</div> : null}

        <AlertDialogFooter>
          {showCancel ? (
            <AlertDialogCancel disabled={cancelDisabled} onClick={onCancel}>
              {cancelLabel}
            </AlertDialogCancel>
          ) : null}
          <AlertDialogAction
            disabled={isActionDisabled}
            className={actionClassName}
            onClick={onAction}
          >
            <span className="inline-flex items-center gap-2">
              {actionLoading ? <Spinner className="size-4" /> : null}
              {actionLabel}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
