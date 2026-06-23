import type { ExternalToast } from "sonner";
import {
  DEFAULT_TOAST_DURATIONS,
  type ShowToastOptions,
  type ToastTone,
} from "@/components/toasts/types/toast.types";

export function resolveToastDuration(
  tone: Exclude<ToastTone, "default">,
  options?: { duration?: number; persist?: boolean },
): number {
  if (options?.persist || options?.duration === 0) {
    return Infinity;
  }

  if (options?.duration !== undefined) {
    return options.duration;
  }

  return DEFAULT_TOAST_DURATIONS[tone];
}

export function toSonnerAction(
  action?: ShowToastOptions["action"],
): ExternalToast["action"] | undefined {
  if (!action) {
    return undefined;
  }

  return {
    label: action.label,
    onClick: () => {
      action.onClick?.();
    },
  };
}

export function toSonnerCancel(
  cancel?: ShowToastOptions["cancel"],
): ExternalToast["cancel"] | undefined {
  if (!cancel) {
    return undefined;
  }

  return {
    label: cancel.label,
    onClick: () => {
      cancel.onClick?.();
    },
  };
}

export function buildToastMessage(
  title: string | undefined,
  description: string,
): { message: string; description?: string } {
  if (title) {
    return { message: title, description };
  }

  return { message: description };
}
