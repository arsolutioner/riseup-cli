import { Command, Option } from "commander";
import { loginAction, logoutAction, statusAction } from "./commands/auth.js";
import { spendingAction } from "./commands/spending.js";
import { incomeAction } from "./commands/income.js";
import { transactionsAction } from "./commands/transactions.js";
import { balanceAction, debtAction } from "./commands/balance.js";
import { trendsAction } from "./commands/trends.js";
import { plansAction } from "./commands/plans.js";
import { insightsAction } from "./commands/insights.js";
import { banksAction, subscriptionAction } from "./commands/account.js";
import { progressAction } from "./commands/progress.js";
import { skillInstallAction, skillStatusAction, skillUninstallAction, skillShowAction } from "./commands/skill.js";
import {
  classifyAction,
  renameAction,
  commentAction,
  excludeAction,
  includeAction,
  mergeAction,
  unclassifiedAction,
  setBudgetTypeAction,
  adjustAction,
} from "./commands/manage.js";

const program = new Command();

program
  .name("riseup")
  .description("Unofficial RiseUp Finance CLI")
  .version("0.4.0");

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
  .addOption(new Option("--income", "Only income transactions").conflicts("expenses"))
  .addOption(new Option("--expenses", "Only expense transactions").conflicts("income"))
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

program
  .command("trends [months]")
  .description("Month-over-month comparison")
  .option("--by <dimension>", "Breakdown: total, category, or breakdown", "total")
  .action(trendsAction);

program
  .command("plans")
  .description("Show savings plans")
  .action(plansAction);

program
  .command("insights")
  .description("Show financial insights")
  .action(insightsAction);

program
  .command("progress")
  .description("Show financial health & savings progress")
  .action(progressAction);

// Transaction management (write) commands
program
  .command("classify <transactionId> <category>")
  .description("Classify a transaction into a category")
  .option("--apply-to <scope>", "Apply to: single or all (future matching)", "all")
  .action(classifyAction);

program
  .command("rename <transactionId> <name>")
  .description("Rename a transaction display name")
  .option("--apply-to <scope>", "Apply to: single or all", "single")
  .action(renameAction);

program
  .command("comment <transactionId> <text>")
  .description("Add a comment/note to a transaction")
  .action(commentAction);

program
  .command("exclude <transactionId>")
  .description("Exclude a transaction from budget")
  .action(excludeAction);

program
  .command("include <transactionId>")
  .description("Re-include an excluded transaction in budget")
  .action(includeAction);

program
  .command("merge <transactionId>")
  .description("Approve a credit card billing merge")
  .option("--input <type>", "Merge type: approved, loan, clearing, addCreds, bug", "approved")
  .action(mergeAction);

program
  .command("unclassified [month]")
  .description("List unclassified transactions")
  .action(unclassifiedAction);

program
  .command("set-budget-type <transactionId> <type>")
  .description("Set transaction as fixed or variable expense")
  .action(setBudgetTypeAction);

program
  .command("adjust <envelopeId> <amount>")
  .description("Adjust a predicted transaction amount")
  .option("--sequence-id <id>", "Sequence ID (required)")
  .option("--budget-date <date>", "Budget month (YYYY-MM, default: current)")
  .option("--no-permanent", "Apply only for this month")
  .action(adjustAction);

const accountCmd = program
  .command("account")
  .description("Account settings");

accountCmd
  .command("banks")
  .description("Show connected banks/cards")
  .action(banksAction);

accountCmd
  .command("subscription")
  .description("Show subscription details")
  .action(subscriptionAction);

// Skill commands
const skillCmd = program
  .command("skill")
  .description("Manage Claude Code skill");

skillCmd
  .command("install")
  .description("Install RiseUp skill for Claude Code")
  .action(skillInstallAction);

skillCmd
  .command("status")
  .description("Check skill installation status")
  .action(skillStatusAction);

skillCmd
  .command("uninstall")
  .description("Remove skill from Claude Code")
  .action(skillUninstallAction);

skillCmd
  .command("show")
  .description("Display skill file content")
  .action(skillShowAction);

program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.optsWithGlobals();
  if (opts.color === false) {
    // chalk 5 checks this env var lazily
    process.env["NO_COLOR"] = "1";
  }
});

program.parse();
