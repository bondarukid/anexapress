import type { BaseToastOptions, ToastAction } from "@/components/toasts/types/toast.types";

export type InteractiveToastOptions = BaseToastOptions & {
  description?: string;
};

export type ActionToastOptions = InteractiveToastOptions & {
  action: ToastAction;
};

export type CancelToastOptions = InteractiveToastOptions & {
  cancel: ToastAction;
};

export type ActionAndCancelToastOptions = InteractiveToastOptions & {
  action: ToastAction;
  cancel: ToastAction;
};
