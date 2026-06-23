import { toast as sonnerToast } from "sonner";
import type {
  PositionToastOptions,
  ToastPosition,
} from "@/components/toasts/types";

/**
 * Position-specific Sonner toasts for all six layout slots.
 */
export const positionToast = {
  withPosition(message: string, position: ToastPosition, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position });
  },

  topLeft(message: string, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position: "top-left" });
  },

  topCenter(message: string, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position: "top-center" });
  },

  topRight(message: string, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position: "top-right" });
  },

  bottomLeft(message: string, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position: "bottom-left" });
  },

  bottomCenter(message: string, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position: "bottom-center" });
  },

  bottomRight(message: string, options?: PositionToastOptions) {
    return sonnerToast(message, { ...options, position: "bottom-right" });
  },
};
