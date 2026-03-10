<div align="center">

<img src="logo.png" alt="riseup-cli" width="200">

# riseup-cli

**Unofficial CLI and agentic skill for [RiseUp](https://www.riseup.co.il) personal finance.** Full programmatic access to your financial data — including features the web app buries — via the terminal and AI agents like Claude Code, Claude Desktop, Codex, and OpenClaw.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/riseup-cli?color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/riseup-cli)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Playwright](https://img.shields.io/badge/Playwright-Auth-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-D97706?logo=anthropic&logoColor=white)](https://claude.com/claude-code)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Amram_Englander-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/amram-englander)

<br>

[Installation](#installation) · [Commands](#commands) · [Claude Skill](#claude-code-and-claude-desktop-skill) · [Docs](https://arsolutioner.github.io/riseup-cli/) · [Contributing](#contributing)

</div>

---

RiseUp is an Israeli personal finance app with no public API. This CLI was built by reverse-engineering the internal API that powers the RiseUp web app, so you can access your own financial data programmatically — from the terminal or through AI agents like Claude Code. All requests go directly from your machine to RiseUp's servers using your own session cookies. Nothing is proxied, stored, or sent anywhere else.

> [!WARNING]
> **Unofficial Library – Use at Your Own Risk**
>
> This tool uses **undocumented RiseUp APIs** that can change without notice.
>
> - **Not affiliated with RiseUp** – This is a community project
> - **APIs may break** – RiseUp can change internal endpoints anytime
> - **Your data stays local** – All requests go directly from your machine to RiseUp's servers using your own session cookies. Nothing is proxied, stored, or sent anywhere else.

## Features

- **Spending breakdown** — by category, merchant, or payment source
- **Income tracking** — salary, benefits, and all income sources
- **Transaction search** — filter by merchant, category, amount, type
- **Bank balances & investments** — balances, securities portfolio, savings, loans
- **Credit card debt** — debt per card at a glance
- **Trends** — month-over-month income vs. expenses, fixed vs. variable breakdown
- **Financial progress** — savings recommendations and spending trend analysis
- **Claude Code skill** — ask Claude about your finances in natural language
- **JSON output** — pipe to jq, scripts, or any tool

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 22+ |
| Google Chrome | Latest |

## Installation

```bash
npm install -g riseup-cli
```

Or install from GitHub:

```bash
npm install -g github:arsolutioner/riseup-cli
```

Then install the browser dependency:

```bash
npx playwright install chromium
```

> [!TIP]
> Both `riseup` and `riseup-cli` work as commands.

## Authentication

RiseUp uses Google OAuth. The CLI opens a real Chrome window so you can sign in manually — no passwords are stored or transmitted by this tool.

```bash
riseup login     # Opens Chrome, sign in, session saved
riseup status    # Check login status and account info
riseup logout    # Clear session
```

> [!TIP]
> Sessions are stored at `~/.config/riseup-cli/session.json` with `chmod 0600`. The browser uses a persistent profile with automation detection disabled so Google OAuth works normally.

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
riseup balance    # Bank balances + investment portfolio
riseup debt       # Credit card debt
```

### Trends

```bash
riseup trends              # 3-month comparison (income vs expenses vs net)
riseup trends 6            # 6-month comparison
riseup trends --by category   # Breakdown by category over time
riseup trends --by breakdown  # Fixed vs variable expenses
```

### Progress

```bash
riseup progress            # Financial health, savings recommendations
```

### More

```bash
riseup plans                  # Savings goals and progress
riseup insights               # AI-generated financial insights
riseup account banks          # Connected banks, status & last sync
riseup account subscription   # Subscription details
```

### Global Options

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (for scripting and piping) |
| `--no-color` | Disable colored output |

### Month Format

Commands that accept a `[month]` argument support:

| Format | Example | Description |
|--------|---------|-------------|
| `current` | `riseup spending current` | Current budget month (default) |
| `prev` | `riseup spending prev` | Previous month |
| `-N` | `riseup spending -2` | N months back |
| `YYYY-MM` | `riseup spending 2026-01` | Specific month |

## AI Agent Skills

riseup-cli ships with a skill so AI agents can query your finances directly using natural language.

### Claude Code

```bash
riseup skill install       # Install the skill
```

### Claude Desktop / claude.ai

1. Download `riseup-skill.zip` from the [latest release](https://github.com/arsolutioner/riseup-cli/releases/latest)
2. Go to **Settings > Customize > Skills > "+" > Upload** and select the ZIP
3. Toggle the skill ON

### OpenClaw

Tell your OpenClaw agent:

> Install the riseup skill from https://github.com/arsolutioner/riseup-cli/releases/latest — download `riseup-skill.zip`, install `riseup-cli` via npm, and set it up. Here is my session file: `<paste contents of ~/.config/riseup-cli/session.json>`

To get your session, login locally first:

```bash
npm install -g riseup-cli
npx playwright install chromium
riseup login
cat ~/.config/riseup-cli/session.json   # Copy this output
```

### Try it

Ask your agent:

- *"How much did I spend this month?"*
- *"What are my subscriptions?"*
- *"Show my salary for the last 3 months"*
- *"Am I saving money?"*
- *"How much did I spend on groceries?"*

```bash
riseup skill status        # Check if installed
riseup skill uninstall     # Remove the skill
riseup skill show          # Display skill content
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 22+ (native fetch, ESM) |
| Language | TypeScript |
| CLI Framework | Commander.js |
| Output | Chalk + cli-table3 |
| Auth | Playwright (headed Chrome) |
| Build | tsup |

## Contributing

Contributions are welcome! This project is built with TypeScript and uses tsup for building.

```bash
git clone https://github.com/arsolutioner/riseup-cli.git
cd riseup-cli
npm install
npm run build
npm run dev -- spending    # Run in dev mode
```

## License

[MIT](LICENSE)
