"use client";

import type { ReactNode } from "react";

import type { BaseDrawerProps, DrawerDirection } from "@/components/drawers/types";
import { useControllableDrawer } from "@/components/drawers/utils/use-controllable-drawer";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNestedRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type DrawerShellProps = BaseDrawerProps & {
  direction: DrawerDirection;
  body: ReactNode;
  useNestedRoot?: boolean;
  showDefaultHandle?: boolean;
  showHeader?: boolean;
};

/**
 * Shared Drawer wrapper for all category components.
 */
export function DrawerShell({
  direction,
  trigger,
  open: openProp,
  onOpenChange,
  title,
  description,
  footer,
  triggerAsChild = false,
  dismissible = true,
  shouldScaleBackground,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  snapPoints,
  activeSnapPoint,
  onActiveSnapPointChange,
  defaultTriggerLabel = "Open drawer",
  body,
  useNestedRoot = false,
  showDefaultHandle = true,
  showHeader = true,
}: DrawerShellProps) {
  const { open, setOpen } = useControllableDrawer({
    open: openProp,
    onOpenChange,
  });

  const RootComponent = useNestedRoot ? DrawerNestedRoot : Drawer;

  const resolvedTrigger = trigger ?? (
    <Button variant="outline">{defaultTriggerLabel}</Button>
  );

  return (
    <RootComponent
      direction={direction}
      open={open}
      onOpenChange={setOpen}
      dismissible={dismissible}
      shouldScaleBackground={shouldScaleBackground}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={onActiveSnapPointChange}
    >
      <DrawerTrigger asChild={triggerAsChild}>{resolvedTrigger}</DrawerTrigger>
      <DrawerContent
        className={contentClassName}
        showDefaultHandle={showDefaultHandle}
      >
        {showHeader && (title || description) ? (
          <DrawerHeader className={cn("gap-1", headerClassName)}>
            {title ? <DrawerTitle>{title}</DrawerTitle> : null}
            {description ? (
              <DrawerDescription>{description}</DrawerDescription>
            ) : null}
          </DrawerHeader>
        ) : null}
        <div className={cn("flex flex-col px-4", bodyClassName)}>{body}</div>
        {footer ? (
          <DrawerFooter className={footerClassName}>{footer}</DrawerFooter>
        ) : null}
      </DrawerContent>
    </RootComponent>
  );
}

export { DrawerClose };
