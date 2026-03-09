import chalk from "chalk";
import type { Command } from "commander";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";

// ── Banks Action ─────────────────────────────

export async function banksAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const settings = await client.account.credentials();

    if (json) {
      printJson(settings.credentialsConfigurations);
      return;
    }

    if (settings.credentialsConfigurations.length === 0) {
      console.log("No connected banks or cards.");
      return;
    }

    const table = createTable({
      head: ["Bank", "Name", "Status", "Accounts", "Open Banking"],
    });

    for (const cred of settings.credentialsConfigurations) {
      table.push([
        cred.bankIdentifier,
        cred.name,
        cred.status,
        String(cred.accounts.length),
        cred.isOBK ? chalk.green("Yes") : "No",
      ]);
    }

    console.log(chalk.bold("Connected Banks & Cards"));
    printTable(table);
  }, { json });
}

// ── Subscription Action ──────────────────────

export async function subscriptionAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const sub = await client.account.subscription();

    if (json) {
      printJson(sub);
      return;
    }

    const table = createTable({ head: ["Field", "Value"] });

    table.push(["Plan", sub.planType]);
    table.push(["Product", sub.productName]);
    table.push(["Status", sub.status]);
    table.push(["Amount", formatNIS(sub.amount)]);
    table.push(["Currency", sub.currency]);
    table.push(["Next Payment", sub.nextPaymentDate]);
    table.push(["Provider", sub.provider]);
    table.push(["Free Tier", sub.isFree ? "Yes" : "No"]);

    if (sub.canceledAt) {
      table.push(["Canceled At", sub.canceledAt]);
    }
    if (sub.scheduledCancellationDate) {
      table.push(["Scheduled Cancellation", sub.scheduledCancellationDate]);
    }

    console.log(chalk.bold("Subscription Details"));
    printTable(table);
  }, { json });
}
