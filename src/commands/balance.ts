import chalk from "chalk";
import type { Command } from "commander";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";

// ── Actions ──────────────────────────────────

/**
 * `riseup balance` -- display account balances.
 */
export async function balanceAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const balances = await client.account.balances();

    if (json) {
      printJson(balances);
      return;
    }

    const table = createTable({ head: ["Account", "Source", "Balance"] });

    for (const b of balances) {
      table.push([
        b.accountNumberPiiValue ?? b.accountNumberPiiId,
        b.source,
        formatNIS(b.balance),
      ]);
    }

    console.log(chalk.bold("Account Balances"));
    printTable(table);

    const total = balances.reduce((sum, b) => sum + b.balance, 0);
    console.log(chalk.bold(`\nTotal: ${formatNIS(total)}`));
  }, { json });
}

/**
 * `riseup debt` -- display credit card debt.
 */
export async function debtAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const debts = await client.account.creditCardDebt();

    if (json) {
      printJson(debts);
      return;
    }

    const table = createTable({ head: ["Card", "Source", "Debt"] });

    for (const d of debts) {
      table.push([d.name, d.source, formatNIS(d.amount)]);
    }

    console.log(chalk.bold("Credit Card Debt"));
    printTable(table);

    const total = debts.reduce((sum, d) => sum + d.amount, 0);
    console.log(chalk.bold(`\nTotal: ${formatNIS(total)}`));
  }, { json });
}
