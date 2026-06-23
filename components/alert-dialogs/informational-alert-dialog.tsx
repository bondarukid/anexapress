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
import type {
  InformationalAlertDialogProps,
  InformationalBadgeVariant,
} from "@/components/alert-dialogs/types/informational-alert-dialog.types";
import { cn } from "@/lib/utils";

function getBadgeClassName(variant: InformationalBadgeVariant) {
  if (variant === "info") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  }

  return "bg-destructive/10 text-destructive";
}

/**
 * Configurable informational alert dialog covering Kibo UI informational-1…7.
 *
 * @example Pattern 1 — simple info
 * ```tsx
 * <InformationalAlertDialog
 *   trigger={<Button variant="outline">Show Info</Button>}
 *   title="System Update"
 *   description="A new system update is available."
 *   actionLabel="OK"
 * />
 * ```
 *
 * @example Pattern 4 — dual action
 * ```tsx
 * <InformationalAlertDialog
 *   icon={Bell}
 *   iconLayout="inline"
 *   title="Stay Updated"
 *   description="Enable notifications to stay informed."
 *   showCancel
 *   cancelLabel="Not Now"
 *   actionLabel="Learn More"
 * />
 * ```
 *
 * @example Pattern 5 — centered tip
 * ```tsx
 * <InformationalAlertDialog
 *   icon={Lightbulb}
 *   iconLayout="centered"
 *   iconVariant="informationalCircle"
 *   headerClassName="items-center"
 *   title="Pro Tip"
 *   descriptionClassName="text-center"
 *   actionLabel="Got it"
 * />
 * ```
 */
export function InformationalAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  badge,
  badgeVariant = "default",
  icon: Icon,
  iconLayout = "none",
  iconVariant = "default",
  iconClassName,
  body,
  showCancel = false,
  cancelLabel = "Not Now",
  actionLabel = "OK",
  onAction,
  onCancel,
  actionLoading = false,
  actionDisabled = false,
  cancelDisabled = false,
  actionClassName,
  headerClassName,
  descriptionClassName,
  contentClassName,
}: InformationalAlertDialogProps) {
  const showInlineIcon = Boolean(Icon) && iconLayout === "inline";
  const showCenteredIcon = Boolean(Icon) && iconLayout === "centered";
  const showInformationalCircle =
    showCenteredIcon && iconVariant === "informationalCircle";

  const inlineIconClassName = cn("size-5", iconClassName ?? "text-blue-500");
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
          {showCenteredIcon && Icon && showInformationalCircle ? (
            <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Icon className="size-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          ) : null}

          {showCenteredIcon && Icon && !showInformationalCircle ? (
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
            <div
              className={cn(
                "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                getBadgeClassName(badgeVariant),
              )}
            >
              {badge}
            </div>
          ) : null}

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
