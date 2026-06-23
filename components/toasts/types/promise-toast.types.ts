import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";

export type PromiseToastMessages<T> = {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
};

export type PromiseToastOptions = ExternalToast;
