import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import chalk from "chalk";

const SKILL_DIR = join(homedir(), ".claude", "skills", "riseup");
const SKILL_DEST = join(SKILL_DIR, "SKILL.md");

function getSkillSource(): string {
  // Resolve relative to this file's location in dist/
  const thisDir = dirname(fileURLToPath(import.meta.url));
  // In dev: src/commands/ → src/data/SKILL.md
  // In dist: dist/ → dist/data/SKILL.md (copied by tsup)
  // Try multiple locations
  const candidates = [
    join(thisDir, "..", "src", "data", "SKILL.md"),   // dev (tsx)
    join(thisDir, "data", "SKILL.md"),                 // dist flat
    join(thisDir, "..", "data", "SKILL.md"),            // dist nested
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return readFileSync(p, "utf-8");
    }
  }
  throw new Error("SKILL.md not found in package. Try reinstalling riseup-cli.");
}

export function skillInstallAction(): void {
  let content: string;
  try {
    content = getSkillSource();
  } catch (err) {
    console.error(chalk.red(err instanceof Error ? err.message : String(err)));
    process.exitCode = 1;
    return;
  }

  mkdirSync(SKILL_DIR, { recursive: true });
  writeFileSync(SKILL_DEST, content, "utf-8");

  console.log(chalk.green("Installed") + ` RiseUp skill to ${SKILL_DEST}`);
  console.log("");
  console.log("Claude Code will now recognize RiseUp finance commands.");
  console.log(`Try: ${chalk.cyan("/riseup")} or ask Claude "how much did I spend this month?"`);
}

export function skillStatusAction(): void {
  if (!existsSync(SKILL_DEST)) {
    console.log(chalk.yellow("Not installed"));
    console.log("");
    console.log(`Run ${chalk.cyan("riseup skill install")} to install the skill.`);
    return;
  }

  console.log(chalk.green("Installed") + ` at ${SKILL_DEST}`);
}

export function skillUninstallAction(): void {
  if (!existsSync(SKILL_DEST)) {
    console.log(chalk.yellow("Skill not installed"));
    return;
  }

  unlinkSync(SKILL_DEST);
  try {
    rmSync(SKILL_DIR, { recursive: false });
  } catch {
    // Directory not empty or already removed — fine
  }

  console.log(chalk.green("Uninstalled") + " RiseUp skill");
  console.log("Claude Code will no longer recognize RiseUp commands.");
}

export function skillShowAction(): void {
  if (!existsSync(SKILL_DEST)) {
    console.log(chalk.yellow("Skill not installed"));
    console.log(`Run ${chalk.cyan("riseup skill install")} first.`);
    return;
  }

  const content = readFileSync(SKILL_DEST, "utf-8");
  console.log(content);
}
