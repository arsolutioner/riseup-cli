import chalk from "chalk";
import type { Command } from "commander";
import type { Budget, CashflowTrends } from "../client/types.js";
import { formatNIS } from "../formatters/currency.js";
import { createTable, printTable } from "../formatters/table.js";
import { printJson } from "../formatters/json.js";
import { offsetMonth } from "../utils/dates.js";
import { withClient } from "./helpers.js";

// ── Types ────────────────────────────────────

interface MonthTotal {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface CategoryRow {
  month: string;
  [category: string]: string | number;
}

// ── Helpers ──────────────────────────────────

// ── Action ───────────────────────────────────

export async function trendsAction(
  months: string | undefined,
  _options: Record<string, unknown>,
  command: Command,
): Promise<void> {
  const opts = command.optsWithGlobals();
  const json = Boolean(opts.json);
  const by: string = (opts.by as string) ?? "total";
  const numMonths = months != null ? Number(months) : 3;

  if (isNaN(numMonths) || numMonths < 1) {
    console.error(chalk.red("Invalid number of months. Must be >= 1."));
    process.exitCode = 1;
    return;
  }

  await withClient(async (client) => {
    if (by === "breakdown") {
      const trends = await client.hamster.cashflowTrends();
      showBreakdown(trends, json);
      return;
    }

    // Fetch budgets for the last N months.
    // The start date is (numMonths - 1) months ago so that we include
    // the current month in the range.
    const startDate = offsetMonth(-(numMonths - 1));
    const budgets = await client.budget.get(startDate, numMonths);

    if (budgets.length === 0) {
      console.error(chalk.yellow("No budget data found for the requested period."));
      process.exitCode = 1;
      return;
    }

    if (by === "category") {
      showByCategory(budgets, json);
    } else {
      showByTotal(budgets, json);
    }
  }, { json });
}

// ── By Total ─────────────────────────────────

function showByTotal(
  budgets: Budget[],
  json: boolean,
): void {
  const rows: MonthTotal[] = budgets.map((budget) => {
    const transactions = budget.envelopes.flatMap((e) => e.actuals);

    const income = transactions
      .filter((tx) => tx.isIncome)
      .reduce((sum, tx) => sum + (tx.incomeAmount ?? 0), 0);

    const expenses = transactions
      .filter((tx) => !tx.isIncome)
      .reduce((sum, tx) => sum + Math.abs(tx.billingAmount ?? 0), 0);

    return {
      month: budget.budgetDate,
      income,
      expenses,
      net: income - expenses,
    };
  });

  if (json) {
    printJson(rows);
    return;
  }

  const table = createTable({ head: ["Month", "Income", "Expenses", "Net"] });

  for (const row of rows) {
    table.push([
      row.month,
      formatNIS(row.income),
      formatNIS(row.expenses),
      row.net >= 0 ? chalk.green(formatNIS(row.net)) : chalk.red(formatNIS(row.net)),
    ]);
  }

  console.log(chalk.bold("Monthly Trends (Total)"));
  printTable(table);
}

// ── By Category ──────────────────────────────

function showByCategory(
  budgets: Budget[],
  json: boolean,
): void {
  // Accumulate category totals across all months to find top 8.
  const globalCategoryTotals = new Map<string, number>();

  // Per-month breakdown.
  const monthData: Array<{ month: string; categories: Map<string, number> }> = [];

  for (const budget of budgets) {
    const transactions = budget.envelopes.flatMap((e) => e.actuals);
    const expenses = transactions.filter((tx) => !tx.isIncome);

    const categories = new Map<string, number>();
    for (const tx of expenses) {
      const cat = tx.expense || "(uncategorized)";
      const amount = Math.abs(tx.billingAmount ?? 0);
      categories.set(cat, (categories.get(cat) ?? 0) + amount);
      globalCategoryTotals.set(cat, (globalCategoryTotals.get(cat) ?? 0) + amount);
    }

    monthData.push({ month: budget.budgetDate, categories });
  }

  // Top 8 categories by total across all months.
  const topCategories = Array.from(globalCategoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  if (json) {
    const rows: CategoryRow[] = monthData.map((md) => {
      const row: CategoryRow = { month: md.month };
      for (const cat of topCategories) {
        row[cat] = md.categories.get(cat) ?? 0;
      }
      return row;
    });
    printJson(rows);
    return;
  }

  const head = ["Month", ...topCategories];
  const table = createTable({ head });

  for (const md of monthData) {
    const row = [
      md.month,
      ...topCategories.map((cat) => formatNIS(md.categories.get(cat) ?? 0)),
    ];
    table.push(row);
  }

  console.log(chalk.bold("Monthly Trends (by Category)"));
  printTable(table);
}

// ── By Breakdown (Fixed vs Variable) ────────

interface BreakdownRow {
  month: string;
  fixed: number;
  variable: number;
  total: number;
}

function showBreakdown(
  trends: CashflowTrends,
  json: boolean,
): void {
  if (json) {
    printJson(trends);
    return;
  }

  // Aggregate fixed entries by month.
  const fixedByMonth = new Map<string, number>();
  for (const entry of trends.fixed) {
    fixedByMonth.set(
      entry.cashflowMonth,
      (fixedByMonth.get(entry.cashflowMonth) ?? 0) + entry.amount,
    );
  }

  // Collect all months from variable entries.
  const rows: BreakdownRow[] = trends.variables.map((v) => {
    const fixed = fixedByMonth.get(v.cashflowMonth) ?? 0;
    return {
      month: v.cashflowMonth,
      fixed,
      variable: v.amount,
      total: fixed + v.amount,
    };
  });

  const table = createTable({
    head: ["Month", "Fixed", "Variable", "Total"],
  });

  for (const row of rows) {
    table.push([
      row.month,
      formatNIS(row.fixed),
      formatNIS(row.variable),
      formatNIS(row.total),
    ]);
  }

  console.log(chalk.bold("Monthly Trends (Fixed vs Variable)"));
  printTable(table);
}
