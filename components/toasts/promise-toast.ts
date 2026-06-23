import { toast as sonnerToast } from "sonner";
import type {
  PromiseToastMessages,
  PromiseToastOptions,
} from "@/components/toasts/types/promise-toast.types";

/**
 * Promise-based Sonner toasts for async operations.
 */
export const promiseToast = {
  track<T>(promise: Promise<T>, messages: PromiseToastMessages<T>, options?: PromiseToastOptions) {
    return sonnerToast.promise(promise, { ...messages, ...options });
  },

  trackWithData<T>(
    promise: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: PromiseToastOptions,
  ) {
    return sonnerToast.promise(promise, { ...messages, ...options });
  },

  trackWithError<T>(
    promise: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: PromiseToastOptions,
  ) {
    return sonnerToast.promise(promise, { ...messages, ...options });
  },
};
