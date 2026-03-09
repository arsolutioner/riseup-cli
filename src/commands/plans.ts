import chalk from "chalk";
import type { Command } from "commander";
import { printJson } from "../formatters/json.js";
import { createTable, printTable } from "../formatters/table.js";
import { formatNIS } from "../formatters/currency.js";
import { withClient } from "./helpers.js";

// ── Action ───────────────────────────────────

export async function plansAction(
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);

  await withClient(async (client) => {
    const plans = await client.plans.list();

    if (plans.length === 0) {
      if (json) {
        printJson([]);
      } else {
        console.log("No savings plans found.");
      }
      return;
    }

    if (json) {
      printJson(plans);
      return;
    }

    const table = createTable({
      head: ["Plan", "Target", "Current", "Progress"],
    });

    for (const plan of plans) {
      const name = String(plan.name ?? plan.planName ?? "(unnamed)");
      const target = Number(plan.targetAmount ?? plan.target ?? 0) || 0;
      const current = Number(plan.currentAmount ?? plan.current ?? 0) || 0;

      let progress: string;
      if (target > 0) {
        const pct = ((current / target) * 100).toFixed(1);
        progress = `${pct}%`;
      } else {
        progress = "-";
      }

      table.push([name, formatNIS(target), formatNIS(current), progress]);
    }

    console.log(chalk.bold("Savings Plans"));
    printTable(table);
  }, { json });
}
