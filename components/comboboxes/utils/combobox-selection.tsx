"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { ComboboxOption } from "@/components/comboboxes/types";
import { findComboboxLabel } from "@/components/comboboxes/utils/combobox-data";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

export function useComboboxOpenState(
  controlledOpen?: boolean,
  controlledOnOpenChange?: (open: boolean) => void,
) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOnOpenChange) {
        controlledOnOpenChange(nextOpen);
        return;
      }
      setInternalOpen(nextOpen);
    },
    [controlledOnOpenChange],
  );

  return { open, setOpen };
}

export function useComboboxSingleValue(
  controlledValue?: string,
  controlledOnValueChange?: (value: string) => void,
  defaultValue = "",
) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (controlledOnValueChange) {
        controlledOnValueChange(nextValue);
        return;
      }
      setInternalValue(nextValue);
    },
    [controlledOnValueChange],
  );

  return { value, setValue };
}

export function useComboboxMultiValue(
  controlledValues?: string[],
  controlledOnValuesChange?: (values: string[]) => void,
  defaultValues: string[] = [],
) {
  const [internalValues, setInternalValues] = useState<string[]>(defaultValues);
  const values = controlledValues ?? internalValues;

  const setValues = useCallback(
    (nextValues: string[]) => {
      if (controlledOnValuesChange) {
        controlledOnValuesChange(nextValues);
        return;
      }
      setInternalValues(nextValues);
    },
    [controlledOnValuesChange],
  );

  return { values, setValues };
}

export function toggleMultiValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

type ComboboxSelectedBadgesProps = {
  options: ComboboxOption[];
  values: string[];
  onRemove: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function ComboboxSelectedBadges({
  options,
  values,
  onRemove,
  placeholder = "Select items...",
  className,
}: ComboboxSelectedBadgesProps) {
  if (values.length === 0) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {values.map((value) => (
        <Badge className="mr-1" key={value} variant="secondary">
          {findComboboxLabel(options, value) ?? value}
          <span
            role="button"
            tabIndex={0}
            aria-label={`Remove ${value}`}
            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove(value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onRemove(value);
              }
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <XIcon className="size-3 text-muted-foreground hover:text-foreground" />
          </span>
        </Badge>
      ))}
    </div>
  );
}

export function useAsyncComboboxSearch(
  search: string,
  onSearch?: (search: string) => void,
  externalLoading?: boolean,
  delayMs = 500,
) {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [internalResults, setInternalResults] = useState<string[]>([]);

  useEffect(() => {
    if (!search) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (onSearch) {
        onSearch(search);
      } else {
        setInternalResults([`${search} - Result 1`, `${search} - Result 2`, `${search} - Result 3`]);
      }
      setDebouncedSearch(search);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, onSearch, search]);

  const isSearching = Boolean(search) && search !== debouncedSearch;

  return {
    isSearching: search ? (externalLoading ?? isSearching) : false,
    results: search && search === debouncedSearch ? internalResults : [],
    setResults: setInternalResults,
  };
}

export function useComboboxLoadingOnOpen(isLoading?: boolean, delayMs = 2000) {
  const [loading, setLoading] = useState(Boolean(isLoading));

  const handleOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        return;
      }
      setLoading(true);
      window.setTimeout(() => setLoading(false), delayMs);
    },
    [delayMs],
  );

  return { loading: isLoading ?? loading, handleOpen };
}
