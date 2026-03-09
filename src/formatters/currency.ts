const nisFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as Israeli New Shekel (ILS) currency.
 *
 * Examples:
 *   formatNIS(1234.5)  → "₪1,234.50"
 *   formatNIS(-500)    → "-₪500.00"
 *   formatNIS(0)       → "₪0.00"
 */
export function formatNIS(amount: number): string {
  // Intl with he-IL locale produces various Unicode control characters
  // (LTR marks, narrow no-break spaces, etc.). Strip them so we get a
  // clean, predictable ASCII-ish string.
  const raw = nisFormatter.format(amount);

  // Remove any Unicode control/formatting characters (U+200E LRM,
  // U+200F RLM, U+202A-U+202E bidi, U+00A0 NBSP) and replace the
  // Hebrew-locale minus (which may be U+2212 or a regular hyphen).
  return raw
    .replace(/[\u200E\u200F\u202A-\u202E\u00A0\u2009]/g, "")
    .replace(/\u2212/g, "-")
    .replace(/\s/g, "");
}
