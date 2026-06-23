import type { ReactNode } from "react";
import type { BaseToastOptions } from "@/components/toasts/types/toast.types";

export type ContentToastOptions = BaseToastOptions & {
  description?: ReactNode;
};

export type RichContentToastOptions = BaseToastOptions & {
  description: ReactNode;
};
