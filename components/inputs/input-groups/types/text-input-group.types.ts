import type {
  BaseInputGroupProps,
  InputGroupCountProps,
  InputGroupInputControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type TextInputGroupVariant =
  | "currency"
  | "urlBuilder"
  | "emailDomain"
  | "characterCounter";

export type TextInputGroupProps = BaseInputGroupProps &
  InputGroupInputControlProps &
  InputGroupCountProps & {
    variant?: TextInputGroupVariant;
    prefix?: string;
    suffix?: string;
    currencySymbol?: string;
    domainSuffix?: string;
  };
