# Getting Started

[RiseUp](https://www.riseup.co.il) is an Israeli personal finance app with no public API. This CLI was built by reverse-engineering the internal API that powers the RiseUp web app, so you can access your own financial data programmatically — from the terminal or through AI agents like Claude Code. All requests go directly from your machine to RiseUp's servers using your own session cookies. Nothing is proxied, stored, or sent anywhere else.

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js     | 22+     |
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

::: tip
Both `riseup` and `riseup-cli` work as commands.
:::

## Authentication

RiseUp uses Google OAuth. The CLI opens a real Chrome window so you can sign in manually — no passwords are stored or transmitted by this tool.

```bash
riseup login     # Opens Chrome, sign in, session saved
riseup status    # Check login status and account info
riseup logout    # Clear session
```

::: tip
Sessions are stored at `~/.config/riseup-cli/session.json` with `chmod 0600`. The browser uses a persistent profile with automation detection disabled so Google OAuth works normally.
:::

## Global Options

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (for scripting and piping) |
| `--no-color` | Disable colored output |

## Month Format

Commands that accept a `[month]` argument support:

| Format | Example | Description |
|--------|---------|-------------|
| `current` | `riseup spending current` | Current budget month (default) |
| `prev` | `riseup spending prev` | Previous month |
| `-N` | `riseup spending -2` | N months back |
| `YYYY-MM` | `riseup spending 2026-01` | Specific month |

::: warning Disclaimer
This is an unofficial tool and is not affiliated with or endorsed by RiseUp. Use at your own risk. The internal API may change at any time.
:::
