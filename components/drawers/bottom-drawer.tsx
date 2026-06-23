"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";

import { bottomPresets } from "@/components/drawers/presets";
import type {
  BottomDrawerProps,
  DrawerEventAction,
  DrawerFormField,
} from "@/components/drawers/types";
import { DrawerScrollList } from "@/components/drawers/utils/drawer-layout";
import { DrawerClose, DrawerShell } from "@/components/drawers/utils/drawer-shell";
import { useControllableDrawer } from "@/components/drawers/utils/use-controllable-drawer";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerNestedRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

/**
 * Bottom drawer covering Kibo UI bottom patterns.
 * https://www.kibo-ui.com/patterns/drawer/bottom
 */
export function BottomDrawer({
  variant = "simple",
  trigger,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  triggerAsChild,
  dismissible,
  shouldScaleBackground,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  snapPoints: snapPointsProp,
  activeSnapPoint: activeSnapPointProp,
  onActiveSnapPointChange,
  defaultTriggerLabel,
  bodyText,
  fields,
  scrollItems,
  nestedTitle,
  nestedDescription,
  nestedTriggerLabel,
  eventDate,
  eventTime,
  eventLocation,
  eventAttendees,
  eventActions,
  onSubmit,
}: BottomDrawerProps) {
  const preset = bottomPresets[variant] as Partial<BottomDrawerProps>;
  const resolvedTitle = title ?? preset.title;
  const resolvedDescription = description ?? preset.description;
  const resolvedBodyText = bodyText ?? preset.bodyText;
  const resolvedFields = fields ?? preset.fields;
  const resolvedScrollItems = scrollItems ?? preset.scrollItems;
  const resolvedSnapPoints = snapPointsProp ?? preset.snapPoints;
  const resolvedNestedTitle = nestedTitle ?? preset.nestedTitle;
  const resolvedNestedDescription = nestedDescription ?? preset.nestedDescription;
  const resolvedNestedTriggerLabel =
    nestedTriggerLabel ?? preset.nestedTriggerLabel ?? "Open nested drawer";
  const resolvedEventDate = eventDate ?? preset.eventDate;
  const resolvedEventTime = eventTime ?? preset.eventTime;
  const resolvedEventLocation = eventLocation ?? preset.eventLocation;
  const resolvedEventAttendees = eventAttendees ?? preset.eventAttendees;
  const resolvedEventActions = eventActions ?? preset.eventActions;
  const resolvedShouldScaleBackground =
    shouldScaleBackground ??
    (variant === "noScaleBackground" ? false : preset.shouldScaleBackground);

  const [internalSnapPoint, setInternalSnapPoint] = useState<number | string | null>(
    resolvedSnapPoints?.[0] ?? null,
  );
  const activeSnapPoint = activeSnapPointProp ?? internalSnapPoint;
  const handleSnapPointChange = (snap: number | string | null) => {
    if (activeSnapPointProp === undefined) {
      setInternalSnapPoint(snap);
    }
    onActiveSnapPointChange?.(snap);
  };

  const renderFormBody = () => (
    <form
      className="pb-4 text-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <FieldGroup className="gap-4">
        {resolvedFields?.map((field: DrawerFormField) => (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id} id={getFieldLabelId(field.id)}>
              {field.label}
            </FieldLabel>
            {field.type === "textarea" ? (
              <Textarea
                id={field.id}
                defaultValue={field.defaultValue}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                id={field.id}
                type={field.type ?? "text"}
                defaultValue={field.defaultValue}
                placeholder={field.placeholder}
              />
            )}
          </Field>
        ))}
      </FieldGroup>
    </form>
  );

  const renderBody = () => {
    if (children) {
      return <div className="flex flex-col gap-4 overflow-y-auto pb-4 text-sm">{children}</div>;
    }

    switch (variant) {
      case "withForm":
        return renderFormBody();

      case "scrollable":
        return (
          <div className="pb-4">
            <DrawerScrollList items={resolvedScrollItems ?? []} />
          </div>
        );

      case "eventDetails":
        return (
          <div className="flex flex-col gap-4 pb-4 text-sm">
            <div className="flex flex-col gap-3">
              {resolvedEventDate ? (
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground size-4 shrink-0" />
                  <span>{resolvedEventDate}</span>
                </div>
              ) : null}
              {resolvedEventTime ? (
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground size-4 shrink-0" />
                  <span>{resolvedEventTime}</span>
                </div>
              ) : null}
              {resolvedEventLocation ? (
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground size-4 shrink-0" />
                  <span>{resolvedEventLocation}</span>
                </div>
              ) : null}
              {resolvedEventAttendees ? (
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground size-4 shrink-0" />
                  <span>{resolvedEventAttendees}</span>
                </div>
              ) : null}
            </div>
            {resolvedEventActions && resolvedEventActions.length > 0 ? (
              <div className="flex gap-2">
                {resolvedEventActions.map((action: DrawerEventAction) => (
                  <Button
                    key={action.id}
                    variant={action.variant ?? "default"}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        );

      default:
        return (
          <p className="text-muted-foreground pb-4 text-sm">
            {resolvedBodyText ?? "Drawer content appears here."}
          </p>
        );
    }
  };

  if (variant === "nested") {
    return (
      <NestedBottomDrawer
        trigger={trigger}
        open={open}
        onOpenChange={onOpenChange}
        title={resolvedTitle}
        description={resolvedDescription}
        footer={footer}
        triggerAsChild={triggerAsChild}
        dismissible={dismissible}
        contentClassName={contentClassName}
        headerClassName={headerClassName}
        bodyClassName={bodyClassName}
        footerClassName={footerClassName}
        defaultTriggerLabel={defaultTriggerLabel}
        nestedTitle={resolvedNestedTitle}
        nestedDescription={resolvedNestedDescription}
        nestedTriggerLabel={resolvedNestedTriggerLabel}
        bodyText={resolvedBodyText}
      >
        {children}
      </NestedBottomDrawer>
    );
  }

  const resolvedFooter =
    footer ??
    (variant === "withForm" && !children ? (
      <>
        <Button onClick={onSubmit}>Submit</Button>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </>
    ) : undefined);

  return (
    <DrawerShell
      direction="bottom"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={resolvedTitle}
      description={resolvedDescription}
      footer={resolvedFooter}
      triggerAsChild={triggerAsChild}
      dismissible={dismissible}
      shouldScaleBackground={resolvedShouldScaleBackground}
      contentClassName={contentClassName}
      headerClassName={headerClassName}
      bodyClassName={cn(
        variant === "scrollable" && "px-0",
        bodyClassName,
      )}
      footerClassName={footerClassName}
      snapPoints={variant === "snapPoints" ? resolvedSnapPoints : undefined}
      activeSnapPoint={variant === "snapPoints" ? activeSnapPoint : undefined}
      onActiveSnapPointChange={
        variant === "snapPoints" ? handleSnapPointChange : undefined
      }
      defaultTriggerLabel={defaultTriggerLabel}
      showDefaultHandle={variant !== "snapPoints"}
      body={
        <>
          {variant === "snapPoints" ? <DrawerHandle /> : null}
          {renderBody()}
        </>
      }
    />
  );
}

type NestedBottomDrawerProps = Pick<
  BottomDrawerProps,
  | "trigger"
  | "open"
  | "onOpenChange"
  | "title"
  | "description"
  | "footer"
  | "triggerAsChild"
  | "dismissible"
  | "contentClassName"
  | "headerClassName"
  | "bodyClassName"
  | "footerClassName"
  | "defaultTriggerLabel"
  | "nestedTitle"
  | "nestedDescription"
  | "nestedTriggerLabel"
  | "bodyText"
  | "children"
>;

function NestedBottomDrawer({
  trigger,
  open: openProp,
  onOpenChange,
  title,
  description,
  footer,
  triggerAsChild,
  dismissible = true,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  defaultTriggerLabel = "Open drawer",
  nestedTitle,
  nestedDescription,
  nestedTriggerLabel = "Open nested drawer",
  bodyText,
  children,
}: NestedBottomDrawerProps) {
  const { open, setOpen } = useControllableDrawer({ open: openProp, onOpenChange });
  const [nestedOpen, setNestedOpen] = useState(false);

  const resolvedTrigger = trigger ?? (
    <Button variant="outline">{defaultTriggerLabel}</Button>
  );

  return (
    <Drawer
      direction="bottom"
      open={open}
      onOpenChange={setOpen}
      dismissible={dismissible}
    >
      <DrawerTrigger asChild={triggerAsChild}>{resolvedTrigger}</DrawerTrigger>
      <DrawerContent className={contentClassName}>
        <DrawerHeader className={cn("gap-1", headerClassName)}>
          {title ? <DrawerTitle>{title}</DrawerTitle> : null}
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className={cn("flex flex-col px-4", bodyClassName)}>
          {children ?? (
            <p className="text-muted-foreground pb-4 text-sm">
              {bodyText ?? "Open the nested drawer below."}
            </p>
          )}
          <DrawerNestedRoot
            open={nestedOpen}
            onOpenChange={setNestedOpen}
            shouldScaleBackground={false}
          >
            <DrawerTrigger asChild>
              <Button variant="secondary" className="mb-4 w-full">
                {nestedTriggerLabel}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="gap-1">
                {nestedTitle ? <DrawerTitle>{nestedTitle}</DrawerTitle> : null}
                {nestedDescription ? (
                  <DrawerDescription>{nestedDescription}</DrawerDescription>
                ) : null}
              </DrawerHeader>
              <div className="px-4 pb-4 text-sm">
                <p className="text-muted-foreground">
                  Nested drawer content with independent state.
                </p>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </DrawerNestedRoot>
        </div>
        {footer ? (
          <DrawerFooter className={footerClassName}>{footer}</DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
