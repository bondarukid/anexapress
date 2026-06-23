import type { BaseToastOptions, ToastPosition } from "@/components/toasts/types/toast.types";

export type PositionToastOptions = BaseToastOptions & {
  description?: string;
  position?: ToastPosition;
};
