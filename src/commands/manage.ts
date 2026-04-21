import chalk from "chalk";
import type { Command } from "commander";
import type { Transaction } from "../client/types.js";
import type { RiseUpClient } from "../client/RiseUpClient.js";
import { parseMonth } from "../utils/dates.js";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";
import { fetchBudgetTransactions } from "./budget-helpers.js";

/**
 * Search current and previous month budgets for a transaction by ID.
 * Returns the Transaction if found, or null.
 */
async function findTransaction(
  client: RiseUpClient,
  transactionId: string,
): Promise<Transaction | null> {
  // Try current month first, then previous
  for (const month of ["current", "prev"] as const) {
    const date = parseMonth(month === "current" ? undefined : "prev");
    const result = await fetchBudgetTransactions(client, date);
    if (!result) continue;
    const tx = result.transactions.find((t) => t.transactionId === transactionId);
    if (tx) return tx;
  }
  return null;
}

// ── classify ────────────────────────────────

export async function classifyAction(
  transactionId: string,
  category: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const applyTo = (opts.applyTo as "single" | "all") ?? "all";

  await withClient(async (client) => {
    // The save-enrichment API requires the businessName field.
    const tx = await findTransaction(client, transactionId);
    if (!tx) {
      const msg = `Transaction ${transactionId} not found in current or previous month budgets.`;
      if (json) {
        printJson({ error: msg });
      } else {
        console.error(chalk.red(msg));
      }
      process.exitCode = 1;
      return;
    }

    await client.transactions.classify(transactionId, tx.businessName, category, applyTo);
    if (json) {
      printJson({ success: true, transactionId, category, applyTo });
    } else {
      console.log(chalk.green(`Transaction ${transactionId} classified as "${category}" (apply: ${applyTo})`));
    }
  }, { json });
}

// ── rename ──────────────────────────────────

export async function renameAction(
  transactionId: string,
  name: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const applyTo = (opts.applyTo as "single" | "all") ?? "single";

  await withClient(async (client) => {
    // The save-enrichment API requires the expense (category) field.
    // Look up the transaction to get its current category.
    const tx = await findTransaction(client, transactionId);
    if (!tx) {
      const msg = `Transaction ${transactionId} not found in current or previous month budgets.`;
      if (json) {
        printJson({ error: msg });
      } else {
        console.error(chalk.red(msg));
      }
      process.exitCode = 1;
      return;
    }

    await client.transactions.rename(transactionId, name, tx.expense, applyTo);
    if (json) {
      printJson({ success: true, transactionId, businessName: name, expense: tx.expense, applyTo });
    } else {
      console.log(chalk.green(`Transaction ${transactionId} renamed to "${name}" (apply: ${applyTo})`));
    }
  }, { json });
}

// ── comment ─────────────────────────────────

export async function commentAction(
  transactionId: string,
  text: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    await client.transactions.comment(transactionId, text);
    if (json) {
      printJson({ success: true, transactionId, comment: text });
    } else {
      console.log(chalk.green(`Comment added to ${transactionId}`));
    }
  }, { json });
}

// ── exclude ─────────────────────────────────

export async function excludeAction(
  transactionId: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    await client.transactions.exclude(transactionId);
    if (json) {
      printJson({ success: true, transactionId, action: "excluded" });
    } else {
      console.log(chalk.green(`Transaction ${transactionId} excluded from budget`));
    }
  }, { json });
}

// ── include ─────────────────────────────────

export async function includeAction(
  transactionId: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    await client.transactions.include(transactionId);
    if (json) {
      printJson({ success: true, transactionId, action: "included" });
    } else {
      console.log(chalk.green(`Transaction ${transactionId} re-included in budget`));
    }
  }, { json });
}

// ── merge ───────────────────────────────────

export async function mergeAction(
  transactionId: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const input = (opts.input as string) ?? "approved";

  await withClient(async (client) => {
    await client.transactions.merge(transactionId, input);
    if (json) {
      printJson({ success: true, transactionId, mergeInput: input });
    } else {
      console.log(chalk.green(`Merge ${input} for transaction ${transactionId}`));
    }
  }, { json });
}

// ── set-budget-type ─────────────────────────

export async function setBudgetTypeAction(
  transactionId: string,
  type: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  if (type !== "fixed" && type !== "variable") {
    const msg = `Invalid budget type "${type}". Must be "fixed" or "variable".`;
    if (json) {
      printJson({ error: msg });
    } else {
      console.error(chalk.red(msg));
    }
    process.exitCode = 1;
    return;
  }

  await withClient(async (client) => {
    await client.transactions.setBudgetType(transactionId, type);
    if (json) {
      printJson({ success: true, transactionId, budgetType: type });
    } else {
      console.log(chalk.green(`Transaction ${transactionId} set to ${type}`));
    }
  }, { json });
}

// ── unclassified (read-only) ────────────────

export async function unclassifiedAction(
  month: string | undefined,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const date = parseMonth(month);

  await withClient(async (client) => {
    const result = await fetchBudgetTransactions(client, date);
    if (!result) return;

    const unclassified = result.transactions.filter(
      (tx: Transaction) => tx.expense === "\u05DB\u05DC\u05DC\u05D9" && !tx.isIncome,
    );

    if (json) {
      printJson(
        unclassified.map((tx: Transaction) => ({
          transactionId: tx.transactionId,
          date: tx.transactionDate,
          amount: Math.abs(tx.billingAmount ?? 0),
          businessName: tx.businessName,
          category: tx.expense,
          source: tx.source,
          ...(tx.accountNumberPiiValue ? { accountNumber: tx.accountNumberPiiValue } : {}),
        })),
      );
      return;
    }

    const table = createTable({
      head: ["ID", "Date", "Amount", "Merchant", "Source"],
    });

    for (const tx of unclassified) {
      table.push([
        tx.transactionId,
        tx.transactionDate,
        formatNIS(Math.abs(tx.billingAmount ?? 0)),
        tx.businessName,
        tx.source,
      ]);
    }

    console.log(chalk.bold(`Unclassified transactions for ${date}`));
    printTable(table);
    console.log(chalk.dim(`${unclassified.length} unclassified transactions`));
  }, { json });
}

// ── adjust ──────────────────────────────────

export async function adjustAction(
  envelopeId: string,
  amount: string,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const budgetDate = (opts.budgetDate as string) ?? new Date().toISOString().slice(0, 7);
  const sequenceId = opts.sequenceId as string;
  const permanent = opts.permanent !== false;

  if (!sequenceId) {
    const msg = "The --sequence-id option is required for adjust.";
    if (json) {
      printJson({ error: msg });
    } else {
      console.error(chalk.red(msg));
    }
    process.exitCode = 1;
    return;
  }

  await withClient(async (client) => {
    await client.transactions.adjustPrediction({
      envelopeId,
      amount: Number(amount),
      applyOnBudgetDate: budgetDate,
      sequenceId,
      isPermanent: permanent,
    });
    if (json) {
      printJson({ success: true, envelopeId, newAmount: Number(amount), budgetDate });
    } else {
      console.log(chalk.green(`Prediction adjusted to ${formatNIS(Number(amount))} for envelope ${envelopeId}`));
    }
  }, { json });
}
