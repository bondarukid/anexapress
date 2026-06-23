import { toast as sonnerToast } from "sonner";
import { contentToast } from "@/components/toasts/content-toast";
import { interactiveToast } from "@/components/toasts/interactive-toast";
import { loadingToast } from "@/components/toasts/loading-toast";
import { positionToast } from "@/components/toasts/position-toast";
import { promiseToast } from "@/components/toasts/promise-toast";
import { standardToast } from "@/components/toasts/standard-toast";
import type {
  ShowToastOptions,
  ToastShortcutOptions,
} from "@/components/toasts/types/toast.types";
import {
  buildToastMessage,
  resolveToastDuration,
  toSonnerAction,
  toSonnerCancel,
} from "@/components/toasts/utils/toast-options";

function showToast(options: ShowToastOptions): void {
  const { message, description } = buildToastMessage(options.title, options.description);
  const duration = resolveToastDuration(options.tone, options);
  const sonnerOptions = {
    id: options.id,
    description,
    duration,
    position: options.position,
    icon: options.icon,
    action: toSonnerAction(options.action),
    cancel: toSonnerCancel(options.cancel),
  };

  switch (options.tone) {
    case "error":
      standardToast.error(message, sonnerOptions);
      break;
    case "success":
      standardToast.success(message, sonnerOptions);
      break;
    case "warning":
      standardToast.warning(message, sonnerOptions);
      break;
    case "info":
      standardToast.info(message, sonnerOptions);
      break;
  }
}

function dismissToast(id?: string | number): void {
  sonnerToast.dismiss(id);
}

function errorToast(description: string, options?: ToastShortcutOptions): void {
  showToast({ ...options, tone: "error", description });
}

function successToast(description: string, options?: ToastShortcutOptions): void {
  showToast({ ...options, tone: "success", description });
}

function infoToast(description: string, options?: ToastShortcutOptions): void {
  showToast({ ...options, tone: "info", description });
}

function warningToast(description: string, options?: ToastShortcutOptions): void {
  showToast({ ...options, tone: "warning", description });
}

/**
 * Unified Sonner toast facade with category namespaces and useAlerts-compatible shortcuts.
 */
export const toast = {
  standard: standardToast,
  content: contentToast,
  interactive: interactiveToast,
  position: positionToast,
  promise: promiseToast,
  loading: loadingToast,
  show: showToast,
  dismiss: dismissToast,
  error: errorToast,
  success: successToast,
  info: infoToast,
  warning: warningToast,
};
