export type NormalizeOtpPasteOptions = {
  maxLength: number;
  transform?: (text: string) => string;
};

/**
 * Normalizes pasted OTP text: trim, optional transform, slice to max length.
 */
export function normalizeOtpPaste(text: string, options: NormalizeOtpPasteOptions): string {
  const transformed = options.transform ? options.transform(text) : text.trim();
  return transformed.slice(0, options.maxLength);
}

/**
 * Reads clipboard text and normalizes it for OTP input.
 */
export async function readOtpFromClipboard(
  options: NormalizeOtpPasteOptions,
): Promise<string> {
  const text = await navigator.clipboard.readText();
  return normalizeOtpPaste(text, options);
}

/**
 * Default paste transformer: strips spaces and hyphens.
 */
export function defaultPasteTransformer(pasted: string): string {
  return pasted.replace(/[\s-]/g, "");
}
