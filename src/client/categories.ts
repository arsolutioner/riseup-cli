import type { Transaction } from "./types.js";

/**
 * RiseUp uses `trackingCategory` for two distinct purposes:
 *
 *  1. A user-chosen category override (e.g. "Eating Out" instead of the
 *     auto "Leisure"). This is what we want to surface.
 *  2. Internal tracking flags like "blacklist" — used to exclude certain
 *     transactions (e.g. recurring BIT transfers) from the budget total.
 *     These are not real categories and should not be shown as such.
 *
 * Known internal flag names that are NOT user-chosen categories.
 */
const INTERNAL_TRACKING_FLAGS = new Set(["blacklist"]);

/**
 * Returns the effective category for a transaction.
 *
 * When the user manually reclassifies a transaction in the RiseUp app
 * (via the "Change category" action), the override is stored on
 * `Transaction.trackingCategory`. The auto-classification remains on
 * `Transaction.expense`.
 *
 * The CLI prefers the user's override when it's a real category.
 * Falls back to `expense` when no override is set or when the
 * override is an internal RiseUp flag (e.g. "blacklist").
 */
export function getEffectiveCategory(tx: Transaction): string {
  const name = tx.trackingCategory?.name;
  if (name && !INTERNAL_TRACKING_FLAGS.has(name)) return name;
  return tx.expense ?? "";
}
