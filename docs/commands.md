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

## login / logout / status

Authentication commands.

```bash
riseup login     # Opens Chrome for Google OAuth sign-in
riseup logout    # Clear session
riseup status    # Show login status and account info
```

See [Getting Started](/getting-started#authentication) for more details on authentication.
