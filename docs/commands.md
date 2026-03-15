# Commands

## spending

Show spending breakdown for a given month.

```bash
riseup spending                          # Current month by category
riseup spending prev                     # Previous month
riseup spending --by merchant --top 10   # Top 10 merchants
riseup spending --by source              # By payment source (bank/card)
riseup spending --category "כלכלה"       # Filter one category
```

| Flag | Description |
|------|-------------|
| `--by <dimension>` | Group by: `category`, `merchant`, or `source` (default: `category`) |
| `--category <name>` | Filter by category name |
| `--top <n>` | Show top N only |

## income

Show income summary for a given month.

```bash
riseup income                   # Current month income
riseup income --salary-only     # Only salary entries
riseup income prev              # Previous month
```

| Flag | Description |
|------|-------------|
| `--salary-only` | Only show salary entries |

## transactions

List all transactions with powerful filtering.

```bash
riseup transactions                          # List all this month
riseup transactions --search "carrefour"     # Search by merchant
riseup transactions --category "רכב"         # Filter by category
riseup transactions --expenses --sort amount # Expenses sorted by amount
riseup transactions --min 500 --max 2000     # Amount range
```

| Flag | Description |
|------|-------------|
| `--search <text>` | Filter by merchant name |
| `--category <name>` | Filter by category |
| `--min <amount>` | Minimum amount |
| `--max <amount>` | Maximum amount |
| `--income` | Only income transactions |
| `--expenses` | Only expense transactions |
| `--sort <field>` | Sort by: `date` or `amount` (default: `date`) |

## balance

Show bank account balances and investment portfolio (securities, savings accounts, loans, mortgages).

```bash
riseup balance
```

## debt

Show credit card debt at a glance.

```bash
riseup debt
```

## trends

Month-over-month comparison of income vs. expenses.

```bash
riseup trends              # 3-month comparison (income vs expenses vs net)
riseup trends 6            # 6-month comparison
riseup trends --by category   # Breakdown by category over time
riseup trends --by breakdown  # Fixed vs variable expenses
```

| Flag | Description |
|------|-------------|
| `--by <dimension>` | Breakdown: `total`, `category`, or `breakdown` (default: `total`) |

## progress

Show financial health metrics and savings recommendations.

```bash
riseup progress
```

Displays average monthly cashflow, positive months count, total savings, recommended monthly savings, current cashflow status, and biggest spending increase with top merchant.

## plans

Show savings goals and progress.

```bash
riseup plans
```

## insights

Show AI-generated financial insights from RiseUp.

```bash
riseup insights
```

## account

### account banks

Show connected banks and cards with connection status, account numbers, and last sync time.

```bash
riseup account banks
```

### account subscription

Show subscription details.

```bash
riseup account subscription
```

## Transaction Management

Commands that modify your RiseUp data. Use with care.

### unclassified

List transactions categorized as "כללי" (General) — these need classification.

```bash
riseup unclassified                # Current month
riseup unclassified prev           # Previous month
riseup unclassified --json         # JSON output with transaction IDs
```

### classify

Classify a transaction into a category. By default (`--apply-to all`), also teaches RiseUp to auto-classify future transactions from the same merchant.

```bash
riseup classify <transactionId> "מזון"                   # Classify + teach future
riseup classify <transactionId> "רכב" --apply-to single  # This transaction only
```

| Flag | Description |
|------|-------------|
| `--apply-to <scope>` | `all` (default) = teach future matching, `single` = this transaction only |

Available categories (Hebrew names):

| Category | English |
|----------|---------|
| כלכלה | Groceries |
| אוכל בחוץ | Eating Out |
| מזון | Food |
| רכב | Car/Vehicle |
| קניות | Shopping |
| ביגוד והנעלה | Clothing & Shoes |
| פארמה | Pharmacy |
| בריאות | Health |
| דיגיטל | Digital |
| תקשורת | Telecom |
| תחבורה ציבורית | Public Transport |
| פנאי | Leisure |
| ביטוח | Insurance |
| ארנונה | Property Tax |
| חשמל | Electricity |
| עמלות | Fees |
| העברות | Transfers |
| תשלומים | Payments |
| שיק | Check |
| תרומה | Donations |
| ביטוח לאומי | National Insurance |
| מס הכנסה | Income Tax |

### rename

Change a transaction's display name.

```bash
riseup rename <transactionId> "Grocery Store"
riseup rename <transactionId> "Monthly Rent" --apply-to all  # Rename all future matches too
```

| Flag | Description |
|------|-------------|
| `--apply-to <scope>` | `single` (default) = this transaction only, `all` = future matching too |

### comment

Add a note/comment to a transaction.

```bash
riseup comment <transactionId> "monthly recurring"
```

### exclude

Exclude a transaction from budget calculations (e.g., duplicates, internal transfers).

```bash
riseup exclude <transactionId>
```

### include

Re-include a previously excluded transaction back into the budget.

```bash
riseup include <transactionId>
```

### merge

Approve a credit card billing merge — confirms that a bank debit matches its credit card transactions.

```bash
riseup merge <transactionId>                    # Approve (default)
riseup merge <transactionId> --input loan       # Mark as loan repayment
```

| Flag | Description |
|------|-------------|
| `--input <type>` | `approved` (default), `loan`, `clearing`, `addCreds`, `bug` |

### set-budget-type

Mark a transaction as a fixed or variable expense.

```bash
riseup set-budget-type <transactionId> fixed      # Fixed (rent, insurance, etc.)
riseup set-budget-type <transactionId> variable    # Variable (groceries, eating out, etc.)
```

### adjust

Adjust a predicted transaction amount.

```bash
riseup adjust <envelopeId> 500 --sequence-id <seqId>
riseup adjust <envelopeId> 500 --sequence-id <seqId> --budget-date 2026-03
riseup adjust <envelopeId> 500 --sequence-id <seqId> --no-permanent
```

| Flag | Description |
|------|-------------|
| `--sequence-id <id>` | Sequence ID (required) |
| `--budget-date <date>` | Budget month YYYY-MM (default: current) |
| `--no-permanent` | Apply only for this month |

## login / logout / status

Authentication commands.

```bash
riseup login     # Opens Chrome for Google OAuth sign-in
riseup logout    # Clear session
riseup status    # Show login status and account info
```

See [Getting Started](/getting-started#authentication) for more details on authentication.
