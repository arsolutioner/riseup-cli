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
    const [creds, accounts] = await Promise.all([
      client.account.credentialsInfo(),
      client.account.credentialAccounts(),
    ]);

    // Build a lookup from credentialsId to account numbers.
    const accountsByCredId = new Map<string, string[]>();
    for (const mapping of accounts) {
      const nums = mapping.accountNumberPiiIds
        .filter((a) => !a.isExcluded && a.accountNumberPiiValue)
        .map((a) => a.accountNumberPiiValue!);
      accountsByCredId.set(mapping.credentialsId, nums);
    }

    if (json) {
      const enriched = creds.map((c) => ({
        ...c,
        accounts: accountsByCredId.get(c.credentialsId) ?? [],
      }));
      printJson(enriched);
      return;
    }

    if (creds.length === 0) {
      console.log("No connected banks or cards.");
      return;
    }

    const table = createTable({
      head: ["Name", "Source", "Status", "Accounts", "Last Synced"],
    });

    for (const cred of creds) {
      const nums = accountsByCredId.get(cred.credentialsId) ?? [];
      const statusDisplay =
        cred.status === "valid"
          ? chalk.green("valid")
          : chalk.red(cred.status);

      table.push([
        cred.name,
        cred.sourceName,
        statusDisplay,
        nums.join(", ") || "-",
        formatRelativeTime(cred.lastScrapedAt),
      ]);
    }

    console.log(chalk.bold("Connected Banks & Cards"));
    printTable(table);
  }, { json });
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
