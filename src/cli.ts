#!/usr/bin/env node
import { Command } from "commander";
import { loginAction, logoutAction, statusAction } from "./commands/auth.js";
import { spendingAction } from "./commands/spending.js";
import { incomeAction } from "./commands/income.js";
import { transactionsAction } from "./commands/transactions.js";
import { balanceAction, debtAction } from "./commands/balance.js";

const program = new Command();

program
  .name("riseup")
  .description("Unofficial RiseUp Finance CLI")
  .version("0.1.0");

// Global options
program.option("--json", "Output as JSON");
program.option("--no-color", "Disable colors");

// Auth commands
program
  .command("login")
  .description("Login via browser")
  .action(loginAction);

program
  .command("logout")
  .description("Clear session")
  .action(logoutAction);

program
  .command("status")
  .description("Show login & account info")
  .action(statusAction);

// Finance commands
program
  .command("spending [month]")
  .description("Show spending breakdown")
  .option("--by <dimension>", "Group by: category, merchant, or source", "category")
  .option("--category <name>", "Filter by category")
  .option("--top <n>", "Show top N only")
  .action(spendingAction);

program
  .command("income [month]")
  .description("Show income summary")
  .option("--salary-only", "Only show salary entries")
  .action(incomeAction);

program
  .command("transactions [month]")
  .description("List all transactions")
  .option("--search <text>", "Filter by merchant name")
  .option("--category <name>", "Filter by category")
  .option("--min <amount>", "Minimum amount")
  .option("--max <amount>", "Maximum amount")
  .option("--income", "Only income transactions")
  .option("--expenses", "Only expense transactions")
  .option("--sort <field>", "Sort by: date or amount", "date")
  .action(transactionsAction);

program
  .command("balance")
  .description("Show account balances")
  .action(balanceAction);

program
  .command("debt")
  .description("Show credit card debt")
  .action(debtAction);

program.parse();
