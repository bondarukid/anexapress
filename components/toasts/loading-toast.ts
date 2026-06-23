import { toast as sonnerToast } from "sonner";
import type {
  LoadingToastOptions,
  LoadingToastUpdateOptions,
} from "@/components/toasts/types/loading-toast.types";

/**
 * Loading Sonner toasts with update and dismiss helpers.
 */
export const loadingToast = {
  show(message: string, options?: LoadingToastOptions) {
    return sonnerToast.loading(message, options);
  },

  update(id: string | number, options: LoadingToastUpdateOptions) {
    return sonnerToast.loading(options.description ?? "", { ...options, id });
  },

  dismiss(id?: string | number) {
    return sonnerToast.dismiss(id);
  },
};
