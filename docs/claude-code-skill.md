# Claude Code and Claude Desktop Skill

riseup-cli ships with a skill that works with [Claude Code](https://claude.com/claude-code) and [Claude Desktop](https://claude.com/download) (Cowork) so Claude can query your finances directly using natural language.

The skill is shared between Claude Code and Cowork — install once, use in both.

## Installation

```bash
riseup skill install       # Install the skill
riseup skill status        # Check if installed
riseup skill uninstall     # Remove the skill
riseup skill show          # Display skill content
```

Once installed, just ask Claude:

- *"How much did I spend this month?"*
- *"What are my subscriptions?"*
- *"Show my salary for the last 3 months"*
- *"Am I saving money?"*
- *"How much did I spend on groceries?"*

## How It Works

The skill file is installed to `~/.claude/skills/riseup/SKILL.md`. Claude Code reads this file to understand which CLI commands to run for your finance queries. Read-only commands run automatically; `login` and `logout` require your confirmation.

## Common Workflows

### "How much did I spend this month?"

```bash
riseup spending
```

### "What are my subscriptions?"

```bash
riseup transactions --json
```

Then Claude analyzes the JSON output to find recurring merchants across months.

### "How much did I spend on groceries?"

```bash
riseup spending --category "כלכלה"
```

### "Am I saving money?"

```bash
riseup trends 6
```

Shows income vs expenses and net for each month.

### "What's my biggest expense?"

```bash
riseup transactions --expenses --sort amount --json
```

### Multi-month analysis

Fetch multiple months with `--json` and compare:

```bash
riseup transactions 2026-01 --json
riseup transactions 2026-02 --json
riseup transactions current --json
```

## Hebrew Category Reference

RiseUp uses Hebrew category names. Common translations:

| Hebrew | English |
|--------|---------|
| כלכלה | Groceries |
| אוכל בחוץ | Eating Out |
| רכב | Car/Vehicle |
| העברות | Transfers |
| קניות | Shopping |
| כללי | General |
| ביטוח | Insurance |
| ארנונה | Property Tax |
| שיק | Check |
| תרומה | Donations |
| ביגוד והנעלה | Clothing and Shoes |
| תשלומים | Payments |
| חשמל | Electricity |
| פארמה | Pharmacy |
| בריאות | Health |
| דיגיטל | Digital |
| תקשורת | Telecom |
| תחבורה ציבורית | Public Transport |
| פנאי | Leisure |
| עמלות | Fees |
| משכורת | Salary |
| קצבאות | Benefits/Allowances |
| מס הכנסה | Income Tax |
| ביטוח לאומי | National Insurance |

## Error Reference

| Error | Meaning | Action |
|-------|---------|--------|
| "No active session" | Not logged in | Run `riseup login` |
| "Session expired" | Cookies expired | Run `riseup login` |
| "No budget data found" | Month too far back | Try a more recent month |
| Navigation timeout | Site slow/down | Retry `riseup login` |

## Known Limitations

- Data goes back approximately 10 months (RiseUp API limitation)
- Login requires a real Chrome browser (Google OAuth blocks automation)
- Category names are in Hebrew (translate for English-speaking users)
- Budget months may not align with calendar months (depends on cashflow start day)
