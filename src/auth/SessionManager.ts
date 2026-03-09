import { mkdir, readFile, writeFile, unlink, chmod } from "node:fs/promises";
import { dirname } from "node:path";
import type { StoredSession } from "../client/types.js";
import { getSessionPath, DEFAULT_COMMIT_HASH } from "../utils/config.js";

/**
 * Manages persisted authentication sessions.
 *
 * Auth tier resolution (highest priority first):
 *   1. Explicit path passed to constructor
 *   2. RISEUP_AUTH environment variable (path to session file)
 *   3. Default XDG path: ~/.config/riseup-cli/session.json
 */
export class SessionManager {
  private readonly path: string;
  private cached: StoredSession | null = null;

  constructor(sessionPath?: string) {
    this.path =
      sessionPath ?? process.env["RISEUP_AUTH"] ?? getSessionPath();
  }

  /** Full path to the session file this manager reads/writes. */
  get sessionPath(): string {
    return this.path;
  }

  /**
   * Load the stored session from disk. Returns null if the file does not
   * exist or cannot be parsed.
   */
  async load(): Promise<StoredSession | null> {
    try {
      const raw = await readFile(this.path, "utf-8");
      const data = JSON.parse(raw) as StoredSession;
      this.cached = data;
      return data;
    } catch {
      this.cached = null;
      return null;
    }
  }

  /**
   * Persist a session to disk. Creates parent directories if needed and
   * restricts the file to owner-only access (chmod 0600).
   */
  async save(session: StoredSession): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(session, null, 2), "utf-8");
    await chmod(this.path, 0o600);
    this.cached = session;
  }

  /** Delete the stored session file and clear the in-memory cache. */
  async clear(): Promise<void> {
    try {
      await unlink(this.path);
    } catch {
      // File may not exist — that's fine.
    }
    this.cached = null;
  }

  /** Returns true when we have a cached (or loadable) session on disk. */
  async isValid(): Promise<boolean> {
    if (this.cached) return true;
    const session = await this.load();
    return session !== null;
  }

  /** Convenience: get cookies string, loading from disk if needed. */
  async getCookies(): Promise<string | null> {
    const session = this.cached ?? (await this.load());
    return session?.cookies ?? null;
  }

  /** Convenience: get the commit hash, falling back to the built-in default. */
  async getCommitHash(): Promise<string> {
    const session = this.cached ?? (await this.load());
    return session?.commitHash ?? DEFAULT_COMMIT_HASH;
  }
}
