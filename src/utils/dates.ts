import { RiseUpError } from "./errors.js";

/**
 * Parse flexible month arguments for CLI commands.
 *
 * Supported formats:
 *   - undefined | "current"  → current month as "YYYY-MM"
 *   - "prev" | "-1"          → previous month
 *   - "-2", "-3", etc.       → N months ago
 *   - "2026-02"              → exact month (pass-through after validation)
 *
 * @returns A "YYYY-MM" string.
 */
export function parseMonth(input?: string): string {
  if (input === undefined || input === "current") {
    return formatMonth(new Date());
  }

  if (input === "prev") {
    return offsetMonth(-1);
  }

  // Relative offset: "-1", "-2", "-3", …
  const relativeMatch = /^-(\d+)$/.exec(input);
  if (relativeMatch) {
    const n = parseInt(relativeMatch[1], 10);
    return offsetMonth(-n);
  }

  // Exact month: "YYYY-MM"
  const exactMatch = /^\d{4}-(0[1-9]|1[0-2])$/.exec(input);
  if (exactMatch) {
    return input;
  }

  throw new RiseUpError(
    `Invalid month format "${input}". Use: "current", "prev", "-N", or "YYYY-MM"`,
  );
}

/** Format a Date as "YYYY-MM". */
function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Return "YYYY-MM" for today's date offset by `delta` months. */
export function offsetMonth(delta: number): string {
  const now = new Date();
  now.setDate(1);
  now.setMonth(now.getMonth() + delta);
  return formatMonth(now);
}
