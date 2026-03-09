import chalk from "chalk";
import { RiseUpClient } from "../client/RiseUpClient.js";
import { SessionManager } from "../auth/SessionManager.js";
import { AuthError, RiseUpError } from "../utils/errors.js";

/**
 * Shared wrapper that handles common setup for commands requiring an
 * authenticated RiseUp client.
 *
 * - Loads an existing session (or prints an error if none exists).
 * - Wires up SessionManager -> HttpClient -> RiseUpClient.
 * - Catches and pretty-prints known error types.
 *
 * NOTE: This is a terminal action -- errors are printed and the process
 * exits with code 1. Callers should not add additional error handling
 * around withClient calls.
 */
export async function withClient(
  fn: (client: RiseUpClient) => Promise<void>,
  options?: { json?: boolean },
): Promise<void> {
  const json = options?.json ?? false;
  const session = new SessionManager();

  const stored = await session.load();
  if (!stored) {
    const msg = "No active session. Run `riseup login` to authenticate.";
    if (json) {
      console.log(JSON.stringify({ error: msg }));
    } else {
      console.error(chalk.red(msg));
    }
    process.exitCode = 1;
    return;
  }

  const client = new RiseUpClient({ sessionManager: session });

  try {
    await fn(client);
  } catch (err) {
    if (err instanceof AuthError) {
      const msg = "Session expired. Run `riseup login` to re-authenticate.";
      if (json) {
        console.log(JSON.stringify({ error: msg }));
      } else {
        console.error(chalk.red(msg));
      }
      process.exitCode = 1;
    } else if (err instanceof RiseUpError) {
      if (json) {
        console.log(JSON.stringify({ error: err.message }));
      } else {
        console.error(chalk.red(err.message));
      }
      process.exitCode = 1;
    } else {
      const msg =
        "An unexpected error occurred: " +
        (err instanceof Error ? err.message : String(err));
      if (json) {
        console.log(JSON.stringify({ error: msg }));
      } else {
        console.error(chalk.red(msg));
      }
      process.exitCode = 1;
    }
  }
}
