type SuffixStyle = "upper" | "lower";

const SUFFIXES: Record<SuffixStyle, { k: string; m: string; b: string }> = {
  upper: { k: "K", m: "M", b: "B" },
  lower: { k: "k", m: "M", b: "B" },
};

/**
 * Abbreviates large numbers for compact stat displays (8432 → 8.4K).
 */
export function formatStatValue(
  value: number,
  decimals = 1,
  suffixStyle: SuffixStyle = "upper",
): string {
  const abs = Math.abs(value);
  const suffix = SUFFIXES[suffixStyle];

  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}${suffix.b}`;
  }

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}${suffix.m}`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}${suffix.k}`;
  }

  return String(value);
}

/**
 * Formats currency values for financial stats displays.
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  decimals = 1,
): string {
  const formatted = formatStatValue(value, decimals);

  if (currency === "USD") {
    return `$${formatted}`;
  }

  return `${formatted} ${currency}`;
}
