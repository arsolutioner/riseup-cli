#!/usr/bin/env node
import { Command } from "commander";
import { loginAction, logoutAction, statusAction } from "./commands/auth.js";

const program = new Command();

program
  .name("riseup")
  .description("Unofficial RiseUp Finance CLI")
  .version("0.1.0");

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

// Placeholder for future commands (Phase 3+)

program.parse();
