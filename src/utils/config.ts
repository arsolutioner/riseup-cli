import { homedir } from "node:os";
import { join } from "node:path";

/** Base URL for the RiseUp web app / API. */
export const BASE_URL = "https://input.riseup.co.il";

/**
 * Default commit hash extracted from the app JS bundle.
 * This is sent as the COMMIT-HASH header on every request.
 */
export const DEFAULT_COMMIT_HASH = "75927d0";

/** Directory where the CLI stores its configuration and session files. */
export function getConfigDir(): string {
  return (
    process.env["XDG_CONFIG_HOME"]
      ? join(process.env["XDG_CONFIG_HOME"], "riseup-cli")
      : join(homedir(), ".config", "riseup-cli")
  );
}

/** Full path to the default session file. */
export function getSessionPath(): string {
  return join(getConfigDir(), "session.json");
}
