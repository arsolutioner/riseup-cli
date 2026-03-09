import chalk from "chalk";
import type { Command } from "commander";
import type { Transaction } from "../client/types.js";
import { parseMonth } from "../utils/dates.js";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";
import { fetchBudgetTransactions } from "./budget-helpers.js";

// ── Action ───────────────────────────────────

export async function transactionsAction(
  month: string | undefined,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const search: string | undefined = opts.search as string | undefined;
  const category: string | undefined = opts.category as string | undefined;
  const min: number | undefined = opts.min != null ? Number(opts.min) : undefined;
  const max: number | undefined = opts.max != null ? Number(opts.max) : undefined;
  const incomeOnly = Boolean(opts.income);
  const expensesOnly = Boolean(opts.expenses);
  const sort: string = (opts.sort as string) ?? "date";

  const date = parseMonth(month);

  await withClient(async (client) => {
    const result = await fetchBudgetTransactions(client, date);
    if (!result) return;

    let transactions: Transaction[] = result.transactions;

    // Apply filters.
    if (incomeOnly) {
      transactions = transactions.filter((tx) => tx.isIncome);
    }
    if (expensesOnly) {
      transactions = transactions.filter((tx) => !tx.isIncome);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      transactions = transactions.filter((tx) =>
        tx.businessName.toLowerCase().includes(lowerSearch),
      );
    }
    if (category) {
      const lowerCategory = category.toLowerCase();
      transactions = transactions.filter(
        (tx) => tx.expense.toLowerCase() === lowerCategory,
      );
    }
    if (min != null) {
      transactions = transactions.filter((tx) => {
        const amount = getDisplayAmount(tx);
        return amount >= min;
      });
    }
    if (max != null) {
      transactions = transactions.filter((tx) => {
        const amount = getDisplayAmount(tx);
        return amount <= max;
      });
    }

    // Sort.
    if (sort === "amount") {
      transactions.sort(
        (a, b) => getDisplayAmount(b) - getDisplayAmount(a),
      );
    } else {
      // Default: sort by date.
      transactions.sort(
        (a, b) =>
          new Date(a.transactionDate).getTime() -
          new Date(b.transactionDate).getTime(),
      );
    }

    if (json) {
      printJson(
        transactions.map((tx) => ({
          date: tx.transactionDate,
          amount: getDisplayAmount(tx),
          businessName: tx.businessName,
          category: tx.expense,
          source: tx.source,
          isIncome: tx.isIncome,
        })),
      );
      return;
    }

    // Table output.
    const table = createTable({
      head: ["Date", "Amount", "Merchant", "Category", "Source"],
    });

    for (const tx of transactions) {
      const amount = getDisplayAmount(tx);
      const prefix = tx.isIncome ? "+" : "-";
      table.push([
        tx.transactionDate,
        `${prefix}${formatNIS(amount)}`,
        tx.businessName,
        tx.expense,
        tx.source,
      ]);
    }

    console.log(chalk.bold(`Transactions for ${date}`));
    printTable(table);
    console.log(chalk.dim(`${transactions.length} transactions`));
  }, { json });
}

/**
 * Get the display amount for a transaction.
 * Income uses incomeAmount; expenses use billingAmount.
 * Returns the absolute value.
 */
function getDisplayAmount(tx: Transaction): number {
  if (tx.isIncome) {
    return Math.abs(tx.incomeAmount ?? 0);
  }
  return Math.abs(tx.billingAmount ?? 0);
}
