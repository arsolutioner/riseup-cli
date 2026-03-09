import chalk from "chalk";
import type { Command } from "commander";
import { parseMonth } from "../utils/dates.js";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";
import { fetchBudgetTransactions } from "./budget-helpers.js";

// ── Types ────────────────────────────────────

interface SpendingGroup {
  name: string;
  total: number;
  count: number;
}

// ── Action ───────────────────────────────────

export async function spendingAction(
  month: string | undefined,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const by: string = (opts.by as string) ?? "category";
  const category: string | undefined = opts.category as string | undefined;
  const top: number | undefined = opts.top != null ? Number(opts.top) : undefined;

  const date = parseMonth(month);

  await withClient(async (client) => {
    const result = await fetchBudgetTransactions(client, date);
    if (!result) return;

    // Spending = expenses only (exclude income).
    const expenses = result.transactions.filter((tx) => !tx.isIncome);

    // Apply --category filter.
    const filtered = category
      ? expenses.filter(
          (tx) => tx.expense.toLowerCase() === category.toLowerCase(),
        )
      : expenses;

    // Group by the selected dimension.
    const groups = new Map<string, SpendingGroup>();
    for (const tx of filtered) {
      let key: string;
      switch (by) {
        case "merchant":
          key = tx.businessName || "(unknown)";
          break;
        case "source":
          key = tx.source || "(unknown)";
          break;
        case "category":
        default:
          key = tx.expense || "(uncategorized)";
          break;
      }

      const existing = groups.get(key);
      const amount = Math.abs(tx.billingAmount ?? 0);
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        groups.set(key, { name: key, total: amount, count: 1 });
      }
    }

    // Sort by total descending.
    let sorted = Array.from(groups.values()).sort((a, b) => b.total - a.total);

    // Apply --top limit.
    if (top != null && top > 0) {
      sorted = sorted.slice(0, top);
    }

    if (json) {
      printJson(sorted);
      return;
    }

    // Table output.
    const label =
      by === "merchant" ? "Merchant" : by === "source" ? "Source" : "Category";
    const table = createTable({ head: [label, "Amount", "Transactions"] });

    for (const group of sorted) {
      table.push([group.name, formatNIS(group.total), String(group.count)]);
    }

    console.log(chalk.bold(`Spending for ${date} (by ${by})`));
    printTable(table);

    const grandTotal = sorted.reduce((sum, g) => sum + g.total, 0);
    console.log(chalk.bold(`\nTotal: ${formatNIS(grandTotal)}`));
  }, { json });
}
