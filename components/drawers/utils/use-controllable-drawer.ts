"use client";

import { useCallback, useState } from "react";

type UseControllableDrawerOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Controlled/uncontrolled drawer open state shared across category components.
 */
export function useControllableDrawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: UseControllableDrawerOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return { open, setOpen };
}
