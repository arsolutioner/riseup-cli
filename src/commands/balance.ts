import chalk from "chalk";
import type { Command } from "commander";
import type { FinancialSummary } from "../client/types.js";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";

// ── Actions ──────────────────────────────────

/**
 * `riseup balance` -- display account balances and investments.
 */
export async function balanceAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const [balances, summary] = await Promise.all([
      client.account.balances(),
      client.account.financialSummary(),
    ]);

    if (json) {
      printJson({ balances, financialSummary: summary });
      return;
    }

    // ── Bank account balances ──
    const balanceTable = createTable({ head: ["Account", "Source", "Balance"] });

    for (const b of balances) {
      balanceTable.push([
        b.accountNumberPiiValue ?? b.accountNumberPiiId,
        b.source,
        formatNIS(b.balance),
      ]);
    }

    console.log(chalk.bold("Account Balances"));
    printTable(balanceTable);

    const total = balances.reduce((sum, b) => sum + b.balance, 0);
    console.log(chalk.bold(`\nTotal: ${formatNIS(total)}`));

    // ── Investments ──
    printFinancialSummary(summary);
  }, { json });
}

// ── Financial Summary Rendering ──────────────

function printFinancialSummary(summary: FinancialSummary): void {
  if (summary.securities.length > 0) {
    const table = createTable({
      head: ["Name", "Units", "Buy Price", "Current", "Value"],
    });

    let totalValue = 0;

    for (const sec of summary.securities) {
      for (const pos of sec.positions) {
        const value = parseFloat(pos.estimatedCurrentValue.amount.amount);
        const buyPrice = parseFloat(pos.averageBuyingPrice.amount);
        const currentPrice = parseFloat(
          pos.financialInstrument.normalisedPrice.amount.amount,
        );
        totalValue += value;

        table.push([
          pos.financialInstrument.name,
          pos.unitsNumber.toLocaleString(),
          formatNIS(buyPrice),
          formatNIS(currentPrice),
          formatNIS(value),
        ]);
      }
    }

    console.log(chalk.bold("\nInvestments"));
    printTable(table);
    console.log(chalk.bold(`\nTotal Investments: ${formatNIS(totalValue)}`));
  }

  if (summary.savingsAccounts.length > 0) {
    console.log(chalk.bold("\nSavings Accounts"));
    console.log(`  ${summary.savingsAccounts.length} account(s)`);
  }

  if (summary.loans.length > 0) {
    console.log(chalk.bold("\nLoans"));
    console.log(`  ${summary.loans.length} loan(s)`);
  }

  if (summary.mortgages.length > 0) {
    console.log(chalk.bold("\nMortgages"));
    console.log(`  ${summary.mortgages.length} mortgage(s)`);
  }
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
