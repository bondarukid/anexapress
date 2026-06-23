import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";

export type ToastTone = "error" | "success" | "warning" | "info" | "default";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastAction = {
  label: string;
  onClick?: () => void;
};

export const DEFAULT_TOAST_DURATIONS: Record<Exclude<ToastTone, "default">, number> = {
  error: 8000,
  success: 4000,
  info: 4000,
  warning: 6000,
};

export type ToastShortcutOptions = Omit<ShowToastOptions, "tone" | "description">;

export type ShowToastOptions = {
  tone: Exclude<ToastTone, "default">;
  title?: string;
  description: string;
  id?: string;
  /** Auto-dismiss after ms. `undefined` = default per tone; `0` = persist. */
  duration?: number;
  /** Keep visible until the user dismisses or triggers an action. */
  persist?: boolean;
  action?: ToastAction;
  cancel?: ToastAction;
  position?: ToastPosition;
  icon?: ReactNode;
};

export type ToastContextValue = {
  show: (options: ShowToastOptions) => void;
  dismiss: (id?: string | number) => void;
  error: (description: string, options?: ToastShortcutOptions) => void;
  success: (description: string, options?: ToastShortcutOptions) => void;
  info: (description: string, options?: ToastShortcutOptions) => void;
  warning: (description: string, options?: ToastShortcutOptions) => void;
};

export type BaseToastOptions = Omit<ExternalToast, "id"> & {
  id?: string | number;
};
