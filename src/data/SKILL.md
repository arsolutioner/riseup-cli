---
name: riseup
description: Query your RiseUp personal finance data — spending, income, balances, transactions, trends, and more. Activate when user mentions finances, spending, income, budget, bank balance, salary, subscriptions, debt, or riseup.
---

# RiseUp Finance CLI Skill

Query your personal finance data from [RiseUp](https://input.riseup.co.il) (Israeli personal finance app) directly through Claude.

## Prerequisites

1. Install the CLI: `npm install -g riseup-cli`
2. Install Playwright browser: `npx playwright install chromium`
3. Authenticate: `riseup login` (opens Chrome for Google OAuth)
4. Verify: `riseup status`

## When This Skill Activates

- User says "/riseup" or mentions the tool by name
- User asks about personal finances, spending, income, budget
- User asks "how much did I spend", "what's my balance", "show my salary"
- User asks about subscriptions, bank accounts, credit card debt
- User asks about financial trends or comparisons

## Autonomy Rules

### Run automatically (no confirmation needed)
- `riseup spending [month]` and all flags
- `riseup income [month]` and all flags
- `riseup transactions [month]` and all flags
- `riseup balance`
- `riseup debt`
- `riseup trends [months]` and all flags
- `riseup progress`
- `riseup plans`
- `riseup insights`
- `riseup account banks`
- `riseup account subscription`
- `riseup status`

### Require user confirmation
- `riseup login` (opens browser)
- `riseup logout` (clears session)

### ALWAYS ask user before running (write operations)
These commands modify your RiseUp account data. Before running any of them:
1. Explain what the command will change and any side effects
2. Show the exact command to be executed
3. Wait for explicit user confirmation

Write commands:
- `riseup classify` — changes transaction category; with `--apply-to all` also teaches future auto-classification
- `riseup rename` — changes transaction display name
- `riseup comment` — adds a note to a transaction
- `riseup exclude` — removes transaction from budget calculations
- `riseup include` — adds excluded transaction back to budget
- `riseup merge` — confirms credit card billing merge (irreversible)
- `riseup set-budget-type` — marks transaction as fixed or variable expense
- `riseup adjust` — changes predicted transaction amount

For batch operations (e.g., classifying multiple unclassified transactions):
- First run `riseup unclassified --json` to show what needs attention
- Present all planned changes in a table
- Ask user to confirm the batch before executing

## Quick Reference

| Task | Command |
|------|---------|
| Current month spending by category | `riseup spending` |
| Spending by merchant, top 10 | `riseup spending --by merchant --top 10` |
| Spending by payment source | `riseup spending --by source` |
| Filter spending to one category | `riseup spending --category "כלכלה"` |
| Previous month spending | `riseup spending prev` |
| Current month income | `riseup income` |
| Salary only | `riseup income --salary-only` |
| All transactions | `riseup transactions` |
| Search transactions by merchant | `riseup transactions --search "carrefour"` |
| Filter by category | `riseup transactions --category "רכב"` |
| Expenses over ₪500 | `riseup transactions --expenses --min 500` |
| Sort by amount | `riseup transactions --sort amount` |
| Bank balance & investments | `riseup balance` |
| Credit card debt | `riseup debt` |
| 6-month trend | `riseup trends 6` |
| Trend by category | `riseup trends --by category` |
| Fixed vs variable expenses | `riseup trends --by breakdown` |
| Financial health & savings | `riseup progress` |
| Savings plans | `riseup plans` |
| AI insights | `riseup insights` |
| Connected banks & status | `riseup account banks` |
| Subscription details | `riseup account subscription` |
| Login status | `riseup status` |
| List unclassified transactions | `riseup unclassified` |
| Unclassified for specific month | `riseup unclassified 2026-02` |
| Classify a transaction | `riseup classify <id> "מזון"` |
| Classify + teach future matching | `riseup classify <id> "מזון" --apply-to all` |
| Rename a transaction | `riseup rename <id> "Grocery Store"` |
| Add a comment/note | `riseup comment <id> "monthly recurring"` |
| Exclude from budget | `riseup exclude <id>` |
| Re-include in budget | `riseup include <id>` |
| Approve CC billing merge | `riseup merge <id>` |
| Set as fixed expense | `riseup set-budget-type <id> fixed` |
| Set as variable expense | `riseup set-budget-type <id> variable` |

## Output Modes

- **Table (default)**: Human-readable tables with colors. Category names are in Hebrew.
- **JSON (`--json`)**: Machine-readable. Use this when you need to analyze, aggregate, or filter data programmatically.

Always use `--json` when you need to do custom analysis (e.g., finding subscriptions, grouping by patterns, calculating averages).

## Month Format

Commands accepting a month argument support:
- `current` — current budget month (default)
- `prev` — previous month
- `2026-02` — specific year-month

Data is available for approximately 10 months back.

## Common Workflows

### "How much did I spend this month?"
```bash
riseup spending
```

### "What are my subscriptions?"
```bash
riseup transactions --json
```
Then analyze the JSON output to find recurring merchants across months.

### "How much did I spend on groceries?"
```bash
riseup spending --category "כלכלה"
```

### "Am I saving money?"
```bash
riseup trends 6
```
Shows income vs expenses and net for each month.

### "What are my investments worth?"
```bash
riseup balance
```
Shows bank balances plus investment portfolio (securities, savings accounts, loans, mortgages).

### "How am I doing financially?"
```bash
riseup progress
```
Shows savings recommendations, positive months count, and spending trend analysis.

### "What are my fixed vs variable expenses?"
```bash
riseup trends --by breakdown
```
Shows fixed and variable expenses per month over ~9 months.

### "Are all my bank connections working?"
```bash
riseup account banks
```
Shows connection status, account numbers, and last sync time for each credential.

### "What's my biggest expense?"
```bash
riseup transactions --expenses --sort amount --json
```

### "How much gas/fuel did I spend?"
```bash
riseup transactions --category "רכב" --json
```
Then filter for gas station merchants in the results.

### Multi-month analysis
Fetch multiple months with `--json` and compare:
```bash
riseup transactions 2026-01 --json
riseup transactions 2026-02 --json
riseup transactions current --json
```

### "Classify all my unclassified transactions"
```bash
riseup unclassified --json
```
Review the list, then for each transaction:
```bash
riseup classify <transactionId> "מזון"
riseup classify <transactionId> "רכב" --apply-to all
```
Use `--apply-to all` (default) to teach RiseUp to auto-classify future transactions from the same merchant. Use `--apply-to single` to classify only this transaction.

Available categories (use Hebrew names):
- כלכלה (Groceries), אוכל בחוץ (Eating Out), רכב (Car), מזון (Food)
- קניות (Shopping), ביגוד והנעלה (Clothing), פארמה (Pharmacy), בריאות (Health)
- דיגיטל (Digital), תקשורת (Telecom), תחבורה ציבורית (Public Transport), פנאי (Leisure)
- ביטוח (Insurance), ארנונה (Property Tax), חשמל (Electricity), עמלות (Fees)
- העברות (Transfers), תשלומים (Payments), שיק (Check), תרומה (Donations)
- ביטוח לאומי (National Insurance), מס הכנסה (Income Tax), משכורת (Salary), קצבאות (Benefits)

### "Exclude duplicate/transfer transactions"
```bash
riseup exclude <transactionId>
```
To undo: `riseup include <transactionId>`

### "Approve pending credit card merges"
```bash
riseup merge <transactionId>
```
Merge types: `--input approved` (default), `loan`, `clearing`, `addCreds`, `bug`

## Hebrew Category Names

Common categories and their English translations:
- כלכלה = Groceries
- אוכל בחוץ = Eating Out
- רכב = Car/Vehicle
- העברות = Transfers
- קניות = Shopping
- כללי = General
- ביטוח = Insurance
- ארנונה = Property Tax
- שיק = Check
- תרומה = Donations
- ביגוד והנעלה = Clothing & Shoes
- תשלומים = Payments
- חשמל = Electricity
- פארמה = Pharmacy
- בריאות = Health
- דיגיטל = Digital
- תקשורת = Telecom
- תחבורה ציבורית = Public Transport
- פנאי = Leisure
- עמלות = Fees
- משכורת = Salary
- קצבאות = Benefits/Allowances
- מס הכנסה = Income Tax
- ביטוח לאומי = National Insurance

## Error Handling

| Error | Meaning | Action |
|-------|---------|--------|
| "No active session" | Not logged in | Run `riseup login` |
| "Session expired" | Cookies expired | Run `riseup login` |
| "No budget data found" | Month too far back | Try a more recent month |
| Navigation timeout | Site slow/down | Retry `riseup login` |

## Budget Months vs Calendar Months

RiseUp budget months may not align with calendar months — they depend on the user's cashflow start day setting. For example, the "March" budget month might cover Jan 30 – Feb 28, meaning actual March-dated transactions appear in the "April" budget month.

When the user asks for a specific calendar month (e.g. "show me March transactions"):

1. Fetch with `--json` and check the actual date range of the returned transactions
2. If the dates don't match the requested calendar month, try the next budget month (e.g. `2026-04` for actual March dates)
3. Always tell the user the actual date range so they understand what they're looking at

Example: User asks "show March spending" on March 10:
```bash
# First try — may return Feb dates (budget month offset)
riseup transactions 2026-03 --json
# Check dates in output — if they're Feb dates, try next month
riseup transactions 2026-04 --json
```

## Known Limitations

- Data goes back ~10 months (RiseUp API limitation)
- Login requires a real Chrome browser (Google OAuth blocks automation)
- Category names are in Hebrew (translate for English-speaking users)
- Budget months may not align with calendar months (see section above)
