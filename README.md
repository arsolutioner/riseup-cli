# riseup-cli

Unofficial CLI for [RiseUp](https://input.riseup.co.il) personal finance — query your spending, income, balances, and more from the terminal.

RiseUp is an Israeli personal finance app with no public API. This tool reverse-engineers the internal API so you can access your own financial data programmatically.

## Requirements

- Node.js 22+
- Google Chrome (for browser-based login)

## Installation

Install from GitHub:

```bash
npm install -g github:arsolutioner/riseup-cli
```

After installation, install the Playwright browser dependency:

```bash
npx playwright install chromium
```

## Authentication

RiseUp uses Google OAuth for login. The CLI opens a real Chrome window so you can sign in manually:

```bash
riseup login
```

This saves your session cookies to `~/.config/riseup-cli/session.json` (chmod 0600). The browser uses a persistent profile with automation detection disabled so Google OAuth works normally.

Check your login status:

```bash
riseup status
```

## Commands

### Spending

```bash
riseup spending                          # Current month by category
riseup spending prev                     # Previous month
riseup spending --by merchant --top 10   # Top 10 merchants
riseup spending --by source              # By payment source (bank/card)
riseup spending --category "כלכלה"       # Filter one category
```

### Income

```bash
riseup income                   # Current month income
riseup income --salary-only     # Only salary entries
riseup income prev              # Previous month
```

### Transactions

```bash
riseup transactions                          # List all this month
riseup transactions --search "carrefour"     # Search by merchant
riseup transactions --category "רכב"         # Filter by category
riseup transactions --expenses --sort amount # Expenses sorted by amount
riseup transactions --min 500 --max 2000     # Amount range
```

### Balances

```bash
riseup balance    # Bank account balances
riseup debt       # Credit card debt
```

### Trends

```bash
riseup trends              # 3-month comparison
riseup trends 6            # 6-month comparison
riseup trends --by category # Breakdown by category
```

### Other

```bash
riseup plans                  # Savings goals
riseup insights               # AI-generated financial insights
riseup account banks          # Connected banks & cards
riseup account subscription   # Subscription details
```

### Global Options

```bash
riseup spending --json      # JSON output (for scripting)
riseup spending --no-color  # Disable colors
```

### Month Format

Commands that accept a month argument support:

- `current` — current budget month (default)
- `prev` — previous month
- `-1`, `-2`, `-3` — relative months
- `2026-02` — specific year-month

## Session Management

```bash
riseup login    # Open browser, authenticate, save session
riseup logout   # Clear saved session
riseup status   # Show login info and account details
```

Sessions are stored at `~/.config/riseup-cli/session.json` with restricted permissions. If your session expires, run `riseup login` again.

## Claude Code Skill

riseup-cli ships with a [Claude Code](https://claude.com/claude-code) skill so Claude can query your finances directly. Install it with:

```bash
riseup skill install
```

Then ask Claude things like "how much did I spend this month?" or "what are my subscriptions?" and it will use the CLI automatically.

```bash
riseup skill status      # Check if skill is installed
riseup skill uninstall   # Remove the skill
riseup skill show        # Display skill file content
```

## Disclaimer

This is an unofficial tool and is not affiliated with or endorsed by RiseUp. Use at your own risk. The internal API may change at any time.

## License

MIT
