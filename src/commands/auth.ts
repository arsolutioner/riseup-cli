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

  let result: { cookies: string; commitHash: string; expiresAt: string | null };
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
      ...(result.expiresAt && { expiresAt: result.expiresAt }),
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

    // Show session expiry if available.
    const session = new SessionManager();
    const stored = await session.load();
    if (stored?.expiresAt) {
      const expires = new Date(stored.expiresAt);
      const now = new Date();
      const diffMs = expires.getTime() - now.getTime();
      if (diffMs <= 0) {
        console.log(chalk.bold("Session: ") + chalk.red("Expired"));
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        parts.push(`${hours}h`);
        console.log(chalk.bold("Expires: ") + `in ${parts.join(" ")} (${expires.toLocaleDateString()})`);
      }
    }

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
