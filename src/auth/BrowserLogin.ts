import { join } from "node:path";
import { chromium } from "playwright";
import { getConfigDir } from "../utils/config.js";
import { DEFAULT_COMMIT_HASH } from "../utils/config.js";

/**
 * Launch a persistent Chromium browser so the user can log in to RiseUp
 * interactively (Google OAuth, SMS, etc.).
 *
 * Uses `launchPersistentContext` with automation flags disabled so that
 * Google OAuth does not block the browser as "insecure".
 *
 * Automatically detects successful login when the URL contains `/home`.
 *
 * @returns cookies as a serialized Cookie header string, plus the
 *          commit hash extracted from the app JS bundle.
 */
export async function browserLogin(): Promise<{
  cookies: string;
  commitHash: string;
  expiresAt: string | null;
}> {
  const browserProfileDir = join(getConfigDir(), "browser-profile");

  // Use a persistent browser context so Google OAuth doesn't flag us.
  // - ignoreDefaultArgs removes --enable-automation (Playwright's default)
  // - --disable-blink-features=AutomationControlled prevents navigator.webdriver = true
  const context = await chromium.launchPersistentContext(browserProfileDir, {
    headless: false,
    channel: "chrome",
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages[0] ?? await context.newPage();

  try {
    await page.goto("https://input.riseup.co.il/login?redirectTo=home", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });

    // Wait for the user to complete the login flow.
    // Successful login redirects to a URL containing "/home".
    await page.waitForURL(
      (url) => {
        const href = url.toString();
        return (
          href.includes("/home") &&
          !href.includes("/login") &&
          !href.includes("account.app.letsriseup")
        );
      },
      { timeout: 5 * 60 * 1000 },
    );

    // Extract cookies from the browser context.
    const playwrightCookies = await context.cookies("https://input.riseup.co.il");
    const cookieString = playwrightCookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieString) {
      throw new Error("No cookies found — login may not have completed.");
    }

    // Find the auth token cookie expiry. Short-lived analytics cookies are
    // ignored — we care about when the actual auth session expires.
    const authCookie = playwrightCookies.find((c) => c.name === "__Host-auth-token");
    const expiresAt = authCookie && authCookie.expires > 0
      ? new Date(authCookie.expires * 1000).toISOString()
      : null;

    // Try to extract the commit hash from the app JS bundle filename.
    let commitHash = DEFAULT_COMMIT_HASH;
    try {
      const extracted: string | null = await page.evaluate(`
        (() => {
          const appScript = document.querySelector('script[src*="app."]');
          if (appScript && appScript.src) {
            const match = /app\\.([a-f0-9]+)\\.js/.exec(appScript.src);
            if (match) return match[1];
          }
          const buildScript = document.querySelector('script[src*="_buildManifest"]');
          if (buildScript && buildScript.src) {
            const match = /\\/_next\\/static\\/([^/]+)\\/_buildManifest/.exec(buildScript.src);
            if (match) return match[1];
          }
          return null;
        })()
      `);

      if (extracted) {
        commitHash = extracted;
      }
    } catch {
      // Commit-hash extraction is best-effort; fall back to default.
    }

    return { cookies: cookieString, commitHash, expiresAt };
  } finally {
    await context.close().catch(() => {});
  }
}
