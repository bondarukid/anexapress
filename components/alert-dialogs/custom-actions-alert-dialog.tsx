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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type {
  CustomAction,
  CustomActionsAlertDialogProps,
  CustomActionsFooterLayout,
} from "@/components/alert-dialogs/types/custom-actions-alert-dialog.types";
import { cn } from "@/lib/utils";

function renderActionContent(action: CustomAction) {
  const Icon = action.icon;

  return (
    <>
      {action.loading ? <Spinner className="size-4" /> : null}
      {Icon && !action.loading ? <Icon className="size-4" /> : null}
      {action.label}
    </>
  );
}

function getFooterLayoutClassName(layout: CustomActionsFooterLayout) {
  switch (layout) {
    case "vertical":
      return "flex-col gap-2 sm:flex-col";
    case "splitBetween":
    case "splitLeading":
      return "gap-2 sm:justify-between";
    default:
      return undefined;
  }
}

function partitionActions(actions: CustomAction[]) {
  const leading = actions.filter((action) => action.position === "leading");
  const trailing = actions.filter(
    (action) => action.position === "trailing" || action.position === "default" || !action.position,
  );

  return { leading, trailing };
}

/**
 * Configurable alert dialog with custom action buttons covering Kibo UI custom-actions-1…5.
 *
 * @example Pattern 1 — actions with icons
 * ```tsx
 * <CustomActionsAlertDialog
 *   trigger={<Button variant="outline">Open External Link</Button>}
 *   title="Leave Site?"
 *   description="You are about to visit an external website."
 *   actions={[
 *     { label: "Stay Here", kind: "cancel" },
 *     { label: "Continue", kind: "action", icon: ExternalLink },
 *   ]}
 * />
 * ```
 *
 * @example Pattern 2 — vertical button stack
 * ```tsx
 * <CustomActionsAlertDialog
 *   footerLayout="vertical"
 *   title="Select an Option"
 *   actions={[
 *     { label: "Edit Item", kind: "action" },
 *     { label: "Duplicate Item", kind: "button", variant: "outline" },
 *     { label: "Cancel", kind: "cancel" },
 *   ]}
 * />
 * ```
 *
 * @example Pattern 3 — split between cancel and action group
 * ```tsx
 * <CustomActionsAlertDialog
 *   footerLayout="splitBetween"
 *   title="Update Report Status"
 *   actions={[
 *     { label: "Cancel", kind: "cancel", position: "leading" },
 *     { label: "Mark as On Hold", kind: "button", variant: "outline", position: "trailing" },
 *     { label: "Mark as Complete", kind: "action", position: "trailing", className: "bg-green-600 hover:bg-green-700" },
 *   ]}
 * />
 * ```
 */
export function CustomActionsAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  badge,
  icon: Icon,
  iconLayout = "none",
  iconClassName,
  body,
  actions,
  footerLayout = "horizontal",
  footerClassName,
  headerClassName,
  descriptionClassName,
  contentClassName,
}: CustomActionsAlertDialogProps) {
  const showInlineIcon = Boolean(Icon) && iconLayout === "inline";
  const showCenteredIcon = Boolean(Icon) && iconLayout === "centered";
  const isVertical = footerLayout === "vertical";
  const isSplit =
    footerLayout === "splitBetween" || footerLayout === "splitLeading";

  const renderAction = (action: CustomAction, index: number) => {
    const kind = action.kind ?? "action";
    const isDisabled = action.disabled || action.loading;
    const actionClassName = cn(isVertical && "m-0", action.className);
    const content = (
      <span className="inline-flex items-center gap-2">{renderActionContent(action)}</span>
    );

    if (kind === "cancel") {
      return (
        <AlertDialogCancel
          key={`${action.label}-${index}`}
          variant={action.variant}
          disabled={isDisabled}
          className={actionClassName}
          onClick={action.onClick}
        >
          {content}
        </AlertDialogCancel>
      );
    }

    if (kind === "button") {
      return (
        <Button
          key={`${action.label}-${index}`}
          type="button"
          variant={action.variant}
          disabled={isDisabled}
          className={actionClassName}
          onClick={action.onClick}
        >
          {content}
        </Button>
      );
    }

    return (
      <AlertDialogAction
        key={`${action.label}-${index}`}
        variant={action.variant}
        disabled={isDisabled}
        className={actionClassName}
        onClick={action.onClick}
      >
        {content}
      </AlertDialogAction>
    );
  };

  const renderFooterActions = () => {
    if (isSplit) {
      const { leading, trailing } = partitionActions(actions);

      return (
        <>
          {leading.map(renderAction)}
          {trailing.length > 0 ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">{trailing.map(renderAction)}</div>
          ) : null}
        </>
      );
    }

    return actions.map(renderAction);
  };

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

        {body ? <div className="text-sm">{body}</div> : null}

        <AlertDialogFooter
          className={cn(getFooterLayoutClassName(footerLayout), footerClassName)}
        >
          {renderFooterActions()}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
