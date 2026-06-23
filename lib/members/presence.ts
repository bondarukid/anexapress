import type { MemberPresenceTone } from "@/types/member-display";

/**
 * Maps presence tone to a Tailwind background class for the status dot.
 */
export function getPresenceDotClass(tone: MemberPresenceTone): string {
  if (tone === "active") {
    return "bg-green-500";
  }
  if (tone === "away") {
    return "bg-yellow-500";
  }
  if (tone === "busy") {
    return "bg-red-500";
  }
  return "bg-gray-500";
}
