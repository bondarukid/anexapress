import type { TextInputGroupProps } from "@/components/inputs/input-groups/types";

export const textPresets = {
  currency: {
    variant: "currency",
    currencySymbol: "$",
    suffix: "USD",
  },
  urlBuilder: {
    variant: "urlBuilder",
    prefix: "https://",
    suffix: ".com",
  },
  emailDomain: {
    variant: "emailDomain",
    domainSuffix: "@vercel.com",
  },
  characterCounter: {
    variant: "characterCounter",
    maxCount: 280,
  },
} satisfies Record<string, Partial<TextInputGroupProps>>;
