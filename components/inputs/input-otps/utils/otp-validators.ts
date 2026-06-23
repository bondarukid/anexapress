import {
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";

export type OtpPatternKind = "digits" | "chars" | "alphanumeric" | "custom";

export function resolveOtpPattern(kind: OtpPatternKind, customPattern?: string): string | undefined {
  switch (kind) {
    case "digits":
      return REGEXP_ONLY_DIGITS;
    case "chars":
      return REGEXP_ONLY_CHARS;
    case "alphanumeric":
      return REGEXP_ONLY_DIGITS_AND_CHARS;
    case "custom":
      return customPattern;
  }
}

export function isOtpComplete(value: string, maxLength: number): boolean {
  return value.length === maxLength;
}
