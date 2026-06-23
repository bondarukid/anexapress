"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

type ToastProviderProps = {
  children: ReactNode;
};

/**
 * Global Sonner host. Mount once in the root layout.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster closeButton position="top-center" />
    </>
  );
}
