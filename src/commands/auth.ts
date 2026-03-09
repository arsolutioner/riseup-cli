import chalk from "chalk";
import { browserLogin } from "../auth/BrowserLogin.js";
import { SessionManager } from "../auth/SessionManager.js";
import { RiseUpClient } from "../client/RiseUpClient.js";
import { withClient } from "./helpers.js";

// ── Commands ────────────────────────────────────

/**
 * `riseup login` — open a browser so the user can authenticate, then
 * persist the session to disk.
 */
export async function loginAction(): Promise<void> {
  console.log(
    chalk.cyan(
      "Opening browser for login… Complete the sign-in in the browser window.",
    ),
  );

  let result: { cookies: string; commitHash: string };
  try {
    result = await browserLogin();
  } catch (err) {
    console.error(
      chalk.red(
        "Browser login failed: " +
          (err instanceof Error ? err.message : String(err)),
      ),
    );
    process.exitCode = 1;
    return;
  }

  const session = new SessionManager();
  try {
    await session.save({
      cookies: result.cookies,
      commitHash: result.commitHash,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(
      chalk.red(
        "Failed to save session: " +
          (err instanceof Error ? err.message : String(err)),
      ),
    );
    process.exitCode = 1;
    return;
  }

  // Quick verification.
  const client = new RiseUpClient({ sessionManager: session });
  try {
    await client.isLoggedIn();
    console.log(chalk.green("Login successful!"));
    console.log(chalk.dim(`Session saved to ${session.sessionPath}`));
  } catch {
    console.log(
      chalk.yellow(
        "Session saved but verification failed — you may need to log in again.",
      ),
    );
  }
}

/**
 * `riseup logout` — delete the stored session.
 */
export async function logoutAction(): Promise<void> {
  const session = new SessionManager();
  await session.clear();
  console.log(chalk.green("Logged out. Session cleared."));
}

/**
 * `riseup status` — display login status and basic account info.
 */
export async function statusAction(): Promise<void> {
  await withClient(async (client) => {
    // Verify session is still valid.
    await client.isLoggedIn();
    console.log(chalk.green("Logged in ✓"));

    // Fetch account info.
    const data = await client.account.sessionData();
    const pm = data.restrictedCustomerData.primaryMember;
    const name = `${pm.firstNamePiiValue} ${pm.lastNamePiiValue}`.trim();

    console.log(chalk.bold("Name:  ") + name);
    console.log(chalk.bold("Email: ") + pm.emailPiiValue);

    // Fetch connected banks count.
    try {
      const creds = await client.account.credentials();
      const count = creds.credentialsConfigurations.length;
      console.log(chalk.bold("Banks: ") + `${count} connected`);
    } catch {
      // Non-critical — skip if credentials endpoint fails.
    }
  });
}
