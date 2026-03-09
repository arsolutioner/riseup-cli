# Contributing

Contributions are welcome! This project is built with TypeScript and uses tsup for building.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 22+ (native fetch, ESM) |
| Language | TypeScript |
| CLI Framework | Commander.js |
| Output | Chalk + cli-table3 |
| Auth | Playwright (headed Chrome) |
| Build | tsup |

## Development Setup

```bash
git clone https://github.com/arsolutioner/riseup-cli.git
cd riseup-cli
npm install
npm run build
npm run dev -- spending    # Run in dev mode
```

## Project Structure

```
src/
  cli.ts            # Entry point, command definitions
  commands/          # One file per command (spending, income, etc.)
  client/            # RiseUp API client and types
  auth/              # Browser login with Playwright
  formatters/        # Table and JSON output formatting
  utils/             # Config, dates, error handling
  data/              # Bundled data files (SKILL.md)
```

## Building

```bash
npm run build       # Build with tsup + copy data files
```

The build script runs tsup and copies `src/data/` to `dist/data/` for bundled assets like the Claude Code skill file.

## Testing

```bash
npm test            # Run tests with vitest
```

## License

[MIT](https://github.com/arsolutioner/riseup-cli/blob/main/LICENSE)
