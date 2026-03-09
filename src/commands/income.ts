import chalk from "chalk";
import type { Command } from "commander";
import { parseMonth } from "../utils/dates.js";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";
import { fetchBudgetTransactions } from "./budget-helpers.js";

// ── Action ───────────────────────────────────

export async function incomeAction(
  month: string | undefined,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const salaryOnly = Boolean(opts.salaryOnly);

  const date = parseMonth(month);

  await withClient(async (client) => {
    const result = await fetchBudgetTransactions(client, date);
    if (!result) return;

    // Filter to income transactions only.
    const allTransactions = result.transactions.filter((tx) => tx.isIncome);

    // Apply --salary-only filter.
    const filtered = salaryOnly
      ? allTransactions.filter((tx) => tx.expense === "\u05DE\u05E9\u05DB\u05D5\u05E8\u05EA")
      : allTransactions;

    // Sort by date.
    filtered.sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime(),
    );

    if (json) {
      printJson(
        filtered.map((tx) => ({
          date: tx.transactionDate,
          amount: tx.incomeAmount,
          businessName: tx.businessName,
          category: tx.expense,
        })),
      );
      return;
    }

    // Table output.
    const table = createTable({
      head: ["Date", "Amount", "Business", "Category"],
    });

    for (const tx of filtered) {
      table.push([
        tx.transactionDate,
        formatNIS(tx.incomeAmount ?? 0),
        tx.businessName,
        tx.expense,
      ]);
    }

    console.log(chalk.bold(`Income for ${date}`));
    printTable(table);

    const total = filtered.reduce(
      (sum, tx) => sum + (tx.incomeAmount ?? 0),
      0,
    );
    console.log(chalk.bold(`\nTotal: ${formatNIS(total)}`));
  }, { json });
}
