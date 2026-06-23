"use client";

import { createContext, useContext } from "react";

export type FieldShellContextValue = {
  controlId: string;
  labelId?: string;
};

const FieldShellContext = createContext<FieldShellContextValue | null>(null);

export function useFieldShellA11y() {
  return useContext(FieldShellContext);
}

export { FieldShellContext };

export { getFieldLabelId } from "@/lib/ui/field-a11y";
