import { toast } from "@/components/toasts";
import type { ToastContextValue } from "@/components/toasts/types";

/**
 * Imperative toast API for components and hooks. Delegates to the unified Sonner facade.
 */
export function useToast(): ToastContextValue {
  return {
    show: toast.show,
    dismiss: toast.dismiss,
    error: toast.error,
    success: toast.success,
    info: toast.info,
    warning: toast.warning,
  };
}
