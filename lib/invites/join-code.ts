import { JOIN_CODE_LENGTH } from "@/types/invite";

const JOIN_CODE_PATTERN = /^[A-Z2-9]{8}$/;

/** Normalize user input to uppercase alphanumeric join code. */
export function normalizeJoinCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z2-9]/g, "")
    .slice(0, JOIN_CODE_LENGTH);
}

export function isValidJoinCode(value: string): boolean {
  return JOIN_CODE_PATTERN.test(normalizeJoinCode(value));
}
