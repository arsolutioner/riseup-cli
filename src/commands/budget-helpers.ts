import type { RiseUpClient } from "../client/RiseUpClient.js";
import type { Transaction, Budget } from "../client/types.js";
import chalk from "chalk";

/**
 * Fetch the budget for a given month and collect all transactions
 * from its envelopes. Returns null (with a printed warning) when
 * no budget exists for the requested date.
 */
export async function fetchBudgetTransactions(
  client: RiseUpClient,
  date: string,
): Promise<{ budget: Budget; transactions: Transaction[] } | null> {
  const budgets = await client.budget.get(date, 1);
  if (budgets.length === 0) {
    console.error(chalk.yellow(`No budget found for ${date}.`));
    process.exitCode = 1;
    return null;
  }
  const budget = budgets[0];
  const transactions = budget.envelopes.flatMap((e) => e.actuals);
  return { budget, transactions };
}
