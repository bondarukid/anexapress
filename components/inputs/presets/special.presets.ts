import type { SpecialInputProps } from "@/components/inputs/types";

/**
 * Kibo UI special input pattern presets.
 */
export const specialPresets = {
  fileUploadList: {
    variant: "fileUploadList",
    id: "file-upload",
    label: "Upload Files",
    multiple: true,
  },
  timeInput: {
    variant: "timeInput",
    id: "time-input",
    label: "Meeting Time",
  },
  rangeWithValue: {
    variant: "rangeWithValue",
    id: "range-slider",
    label: "Volume",
    defaultValue: 50,
    min: 0,
    max: 100,
    rangeMinLabel: "0%",
    rangeMaxLabel: "100%",
    valueLabelFormatter: (value: number) => `${value}%`,
  },
  disabled: {
    variant: "disabled",
    id: "disabled-input",
    label: "Account ID",
    defaultValue: "ACC-12345",
    disabled: true,
    helperText: "This field cannot be edited.",
  },
  currency: {
    variant: "currency",
    id: "currency-input",
    label: "Amount",
    placeholder: "0.00",
    helperText: "Enter amount in USD",
    min: 0,
    step: 0.01,
  },
} satisfies Record<string, Partial<SpecialInputProps>>;
