import { toast as sonnerToast } from "sonner";
import type { StandardToastOptions } from "@/components/toasts/types/standard-toast.types";
import { DEFAULT_TOAST_DURATIONS } from "@/components/toasts/types/toast.types";

function withDefaultDuration(
  duration: number | undefined,
  fallback: number,
): number | undefined {
  return duration ?? fallback;
}

/**
 * Standard Sonner toasts: default, success, error, warning, info.
 */
export const standardToast = {
  default(message: string, options?: StandardToastOptions) {
    return sonnerToast(message, options);
  },

  success(message: string, options?: StandardToastOptions) {
    return sonnerToast.success(message, {
      duration: withDefaultDuration(options?.duration, DEFAULT_TOAST_DURATIONS.success),
      ...options,
    });
  },

  error(message: string, options?: StandardToastOptions) {
    return sonnerToast.error(message, {
      duration: withDefaultDuration(options?.duration, DEFAULT_TOAST_DURATIONS.error),
      ...options,
    });
  },

  warning(message: string, options?: StandardToastOptions) {
    return sonnerToast.warning(message, {
      duration: withDefaultDuration(options?.duration, DEFAULT_TOAST_DURATIONS.warning),
      ...options,
    });
  },

  info(message: string, options?: StandardToastOptions) {
    return sonnerToast.info(message, {
      duration: withDefaultDuration(options?.duration, DEFAULT_TOAST_DURATIONS.info),
      ...options,
    });
  },
};
