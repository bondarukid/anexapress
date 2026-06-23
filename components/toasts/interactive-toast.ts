import { toast as sonnerToast } from "sonner";
import type {
  ActionAndCancelToastOptions,
  ActionToastOptions,
  CancelToastOptions,
  InteractiveToastOptions,
} from "@/components/toasts/types/interactive-toast.types";

/**
 * Interactive Sonner toasts: action, cancel, combined, non-dismissible.
 */
export const interactiveToast = {
  withAction(message: string, options: ActionToastOptions) {
    const { action, ...rest } = options;
    return sonnerToast(message, {
      ...rest,
      action: {
        label: action.label,
        onClick: () => {
          action.onClick?.();
        },
      },
    });
  },

  withCancel(message: string, options: CancelToastOptions) {
    const { cancel, ...rest } = options;
    return sonnerToast(message, {
      ...rest,
      cancel: {
        label: cancel.label,
        onClick: () => {
          cancel.onClick?.();
        },
      },
    });
  },

  withActionAndCancel(message: string, options: ActionAndCancelToastOptions) {
    const { action, cancel, ...rest } = options;
    return sonnerToast(message, {
      ...rest,
      action: {
        label: action.label,
        onClick: () => {
          action.onClick?.();
        },
      },
      cancel: {
        label: cancel.label,
        onClick: () => {
          cancel.onClick?.();
        },
      },
    });
  },

  nonDismissible(message: string, options?: InteractiveToastOptions) {
    return sonnerToast(message, {
      ...options,
      duration: Infinity,
      dismissible: false,
    });
  },
};
