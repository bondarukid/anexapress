"use client";

import { useCallback, useState } from "react";

type UseControllableInputOptions = {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
};

/**
 * Controlled/uncontrolled input state shared across category components.
 */
export function useControllableInput({
  value: valueProp,
  defaultValue = "",
  onChange,
}: UseControllableInputOptions) {
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue));

  const isControlled = valueProp !== undefined;
  const value = isControlled ? String(valueProp) : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  return { value, setValue };
}
