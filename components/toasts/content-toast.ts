import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import type {
  ContentToastOptions,
  RichContentToastOptions,
} from "@/components/toasts/types/content-toast.types";

/**
 * Content-rich Sonner toasts: description, custom icon, duration, multiline, rich JSX.
 */
export const contentToast = {
  withDescription(message: string, description: string, options?: ContentToastOptions) {
    return sonnerToast(message, { ...options, description });
  },

  withCustomIcon(message: string, icon: ReactNode, options?: ContentToastOptions) {
    return sonnerToast(message, { ...options, icon });
  },

  withDuration(message: string, duration: number, options?: ContentToastOptions) {
    return sonnerToast(message, { ...options, duration });
  },

  multiline(message: string, options?: ContentToastOptions) {
    return sonnerToast(message, {
      ...options,
      className: options?.className,
      description: options?.description,
    });
  },

  richContent(message: string, options: RichContentToastOptions) {
    return sonnerToast(message, options);
  },
};
