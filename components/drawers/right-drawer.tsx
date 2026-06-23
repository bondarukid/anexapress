"use client";

import { rightPresets } from "@/components/drawers/presets";
import type { DrawerFormField, RightDrawerProps } from "@/components/drawers/types";
import {
  DrawerCartList,
  DrawerFilterPanel,
  DrawerNotificationList,
  DrawerSettingsPanel,
} from "@/components/drawers/utils/drawer-layout";
import { DrawerClose, DrawerShell } from "@/components/drawers/utils/drawer-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

/**
 * Right drawer covering Kibo UI right patterns.
 * https://www.kibo-ui.com/patterns/drawer/right
 */
export function RightDrawer({
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
  defaultTriggerLabel,
  bodyText,
  fields,
  filterSections,
  settingGroups,
  cartItems,
  notifications,
  onApplyFilters,
  onResetFilters,
  onCheckout,
  onSubmit,
}: RightDrawerProps) {
  const preset = rightPresets[variant] as Partial<RightDrawerProps>;
  const resolvedTitle = title ?? preset.title;
  const resolvedDescription = description ?? preset.description;
  const resolvedBodyText = bodyText ?? preset.bodyText;
  const resolvedFields = fields ?? preset.fields;
  const resolvedFilterSections = filterSections ?? preset.filterSections;
  const resolvedSettingGroups = settingGroups ?? preset.settingGroups;
  const resolvedCartItems = cartItems ?? preset.cartItems;
  const resolvedNotifications = notifications ?? preset.notifications;

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

      case "filterPanel":
        return (
          <div className="pb-4">
            <DrawerFilterPanel
              sections={resolvedFilterSections ?? []}
              onApply={onApplyFilters}
              onReset={onResetFilters}
            />
          </div>
        );

      case "settingsPanel":
        return (
          <div className="pb-4">
            <DrawerSettingsPanel groups={resolvedSettingGroups ?? []} />
          </div>
        );

      case "shoppingCart":
        return (
          <div className="pb-4">
            <DrawerCartList items={resolvedCartItems ?? []} onCheckout={onCheckout} />
          </div>
        );

      case "notifications":
        return (
          <div className="pb-4">
            <DrawerNotificationList items={resolvedNotifications ?? []} />
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
      direction="right"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={resolvedTitle}
      description={resolvedDescription}
      footer={resolvedFooter}
      triggerAsChild={triggerAsChild}
      dismissible={dismissible}
      shouldScaleBackground={shouldScaleBackground}
      contentClassName={cn("sm:max-w-sm", contentClassName)}
      headerClassName={headerClassName}
      bodyClassName={bodyClassName}
      footerClassName={footerClassName}
      defaultTriggerLabel={defaultTriggerLabel}
      body={renderBody()}
    />
  );
}
