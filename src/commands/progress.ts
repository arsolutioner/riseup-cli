import chalk from "chalk";
import type { Command } from "commander";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { withClient } from "./helpers.js";

// ── Action ───────────────────────────────────

/**
 * `riseup progress` -- display financial health and savings progress.
 */
export async function progressAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const progress = await client.hamster.customerProgress();

    if (json) {
      printJson(progress);
      return;
    }

    const table = createTable({ head: ["", ""] });

    const { progressState } = progress;

    table.push(["Status", humanizeStatus(progressState.progressStatus)]);
    table.push(["Avg Monthly Cashflow", formatNIS(progress.averageCashflows)]);
    table.push(["Positive Months", String(progress.positiveCashflowsCount)]);
    table.push(["Total Savings", formatNIS(progress.totalSavings)]);
    table.push([
      "Recommended Savings",
      formatNIS(progressState.monthlySavingsRecommendation),
    ]);
    table.push([
      "Current Cashflow",
      progressState.currentOshIsPositive
        ? chalk.green("Positive")
        : chalk.red("Negative"),
    ]);

    console.log(chalk.bold("Financial Progress"));
    printTable(table);

    // Show biggest spending increase if available.
    const trend = progress.topCategoryTrends.highestNegativeChangeCategory;
    if (trend) {
      const trendTable = createTable({ head: ["", ""] });

      trendTable.push(["Biggest Spending Increase", trend.categoryName]);

      const pct = Math.round(trend.quarterlyChangePercentage * 100);
      trendTable.push([
        "Change",
        `+${formatNIS(trend.quarterlyChangeAmount)} (${pct}%)`,
      ]);

      if (trend.topBusinessNames.length > 0) {
        trendTable.push(["Top Merchant", trend.topBusinessNames[0].businessName]);
      }

      console.log("");
      printTable(trendTable);
    }
  }, { json });
}

function humanizeStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
