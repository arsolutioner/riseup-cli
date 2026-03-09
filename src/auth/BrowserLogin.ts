import { chromium } from "playwright";
import { DEFAULT_COMMIT_HASH } from "../utils/config.js";

/**
 * Launch a headed Chromium browser so the user can log in to RiseUp
 * interactively (Google OAuth, SMS, etc.).
 *
 * The function waits for the URL to contain `/home` (indicating a
 * successful login), then extracts all cookies and an optional commit
 * hash from the page before closing the browser.
 *
 * @returns cookies as a serialized Cookie header string, plus the
 *          commit hash extracted from the app JS bundle.
 */
export async function browserLogin(): Promise<{
  cookies: string;
  commitHash: string;
}> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the login page.
    await page.goto("https://input.riseup.co.il/login?redirectTo=home");

    // Wait for the user to complete the login flow.
    // Successful login redirects to a URL containing "/home".
    // We exclude URLs that still contain "/login" or the OAuth domain.
    await page.waitForURL(
      (url) => {
        const href = url.toString();
        return (
          href.includes("/home") &&
          !href.includes("/login") &&
          !href.includes("account.app.letsriseup")
        );
      },
      { timeout: 5 * 60 * 1000 }, // 5 minutes for user to complete login
    );

    // Extract cookies from the browser context.
    const playwrightCookies = await context.cookies();
    const cookieString = playwrightCookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // Try to extract the commit hash from the app JS bundle filename.
    // The bundle URL typically looks like: /_next/static/<hash>/_buildManifest.js
    // or the app chunk contains the hash in its path.
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

    return { cookies: cookieString, commitHash };
  } finally {
    await browser.close();
  }
}
