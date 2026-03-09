import chalk from "chalk";
import type { Command } from "commander";
import { printJson } from "../formatters/json.js";
import { createTable, printTable } from "../formatters/table.js";
import { withClient } from "./helpers.js";

// ── Helpers ──────────────────────────────────

/**
 * Convert a camelCase or PascalCase string to Title Case.
 * e.g. "unusualSpending" → "Unusual Spending"
 */
function camelToTitleCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Format an ISO date string to a readable short date.
 */
function formatDate(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Action ───────────────────────────────────

export async function insightsAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const insights = await client.insights.all();

    if (insights.length === 0) {
      if (json) {
        printJson([]);
      } else {
        console.log("No insights available.");
      }
      return;
    }

    if (json) {
      printJson(insights);
      return;
    }

    const table = createTable({
      head: ["Insight", "Budget Month", "Delivered", "Snoozed"],
    });

    for (const insight of insights) {
      table.push([
        camelToTitleCase(insight.insightName),
        insight.budgetDate,
        formatDate(insight.deliveredAt),
        insight.snoozed ? chalk.yellow("Yes") : "No",
      ]);
    }

    console.log(chalk.bold("Insights"));
    printTable(table);
  }, { json });
}
