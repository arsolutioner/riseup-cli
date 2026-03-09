const CDP = require("chrome-remote-interface");
const fs = require("fs");

const OUTPUT_FILE = "/Users/aenglander/personal/riseup-api/captured-api.json";
const captured = [];
const seenRequests = new Map();

const ROUTES_TO_VISIT = [
  "/home",
  "/cashflow",
  "/cashflow/transactions",
  "/cashflow/predictions",
  "/cashflow/tracking-categories",
  "/budget",
  "/settings",
  "/settings/credentials",
  "/settings/subscription",
  "/settings/personal-details",
  "/settings/notifications",
  "/plans",
  "/plan-ahead",
  "/insights",
  "/daily-routine",
  "/stories",
  "/benefits",
  "/vouchers",
  "/saving",
  "/mortgage",
  "/ambassadors",
  "/referrals",
  "/advisory",
  "/challenges",
];

function save() {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(captured, null, 2));
}

(async () => {
  console.log("\n========================================");
  console.log(" RiseUp API Capture (CDP) - Step 2");
  console.log("========================================\n");

  let client;
  try {
    const targets = await CDP.List({ host: "127.0.0.1", port: 9333 });
    const riseupTab = targets.find(
      (t) => t.type === "page" && t.url.includes("riseup.co.il")
    ) || targets.find(
      (t) => t.type === "page" && t.url.includes("letsriseup.com")
    ) || targets.find((t) => t.type === "page");

    if (riseupTab) {
      console.log("Found tab:", riseupTab.title);
      console.log("URL:", riseupTab.url);
      client = await CDP({ host: "127.0.0.1", port: 9333, target: riseupTab });
    } else {
      client = await CDP({ host: "127.0.0.1", port: 9333 });
    }
  } catch (err) {
    console.error("Could not connect to Chrome!", err.message);
    process.exit(1);
  }

  const { Network, Page, Runtime } = client;
  await Network.enable();
  await Page.enable();
  await Runtime.enable();

  // Capture requests
  Network.requestWillBeSent((params) => {
    const url = params.request.url;
    if (url.includes("/api/")) {
      const entry = {
        requestId: params.requestId,
        timestamp: new Date().toISOString(),
        method: params.request.method,
        url: url,
        path: new URL(url).pathname,
        requestHeaders: params.request.headers,
        requestBody: null,
      };
      if (params.request.postData) {
        try {
          entry.requestBody = JSON.parse(params.request.postData);
        } catch {
          entry.requestBody = params.request.postData;
        }
      }
      seenRequests.set(params.requestId, entry);
    }
  });

  Network.responseReceived(async (params) => {
    const entry = seenRequests.get(params.requestId);
    if (entry) {
      entry.status = params.response.status;
      entry.responseHeaders = params.response.headers;
      entry.mimeType = params.response.mimeType;
      try {
        const { body, base64Encoded } = await Network.getResponseBody({
          requestId: params.requestId,
        });
        const text = base64Encoded
          ? Buffer.from(body, "base64").toString()
          : body;
        try {
          entry.responseBody = JSON.parse(text);
        } catch {
          entry.responseBody = text.substring(0, 5000);
        }
      } catch {
        entry.responseBody = "<pending>";
      }
      captured.push(entry);
      seenRequests.delete(params.requestId);
      const short = entry.method.padEnd(6) + " " + entry.path + " -> " + entry.status;
      console.log(short);
      save();
    }
  });

  Network.loadingFinished(async (params) => {
    const entry = captured.find(
      (e) => e.requestId === params.requestId && e.responseBody === "<pending>"
    );
    if (entry) {
      try {
        const { body, base64Encoded } = await Network.getResponseBody({
          requestId: params.requestId,
        });
        const text = base64Encoded
          ? Buffer.from(body, "base64").toString()
          : body;
        try {
          entry.responseBody = JSON.parse(text);
        } catch {
          entry.responseBody = text.substring(0, 5000);
        }
        save();
      } catch {}
    }
  });

  // Verify we're actually logged in by checking the logged-in endpoint
  console.log("Verifying login status...");
  await Page.navigate({ url: "https://input.riseup.co.il/home" });
  await new Promise((r) => setTimeout(r, 5000));

  const { result: urlCheck } = await Runtime.evaluate({
    expression: "window.location.href",
  });

  if (urlCheck.value.includes("login") || urlCheck.value.includes("account.app.letsriseup")) {
    console.log("\n❌ NOT logged in! Current URL:", urlCheck.value);
    console.log("\nPlease log in first in the Chrome window, then run this script again.");
    await client.close();
    process.exit(1);
  }

  console.log("✅ Logged in! URL:", urlCheck.value);
  console.log("\n🚀 Auto-navigating all sections...\n");

  for (const route of ROUTES_TO_VISIT) {
    const fullUrl = "https://input.riseup.co.il" + route;
    try {
      console.log(`\n📍 -> ${route}`);
      await Page.navigate({ url: fullUrl });
      await new Promise((r) => setTimeout(r, 4000));

      // Scroll the page
      await Runtime.evaluate({
        expression: `
          (async () => {
            for (let i = 0; i < 10; i++) {
              window.scrollBy(0, 400);
              await new Promise(r => setTimeout(r, 300));
            }
            window.scrollTo(0, 0);
          })()
        `,
        awaitPromise: true,
      });
      await new Promise((r) => setTimeout(r, 2000));

      // Click expandable elements
      await Runtime.evaluate({
        expression: `
          (async () => {
            const buttons = document.querySelectorAll('button, [role="button"]');
            for (const btn of buttons) {
              const t = btn.textContent || '';
              if (t.includes('עוד') || t.includes('more') || t.includes('הצג')) {
                try { btn.click(); await new Promise(r => setTimeout(r, 800)); } catch {}
              }
            }
          })()
        `,
        awaitPromise: true,
      });
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.log(`   ⚠️  Skipped: ${err.message.split("\n")[0]}`);
    }
  }

  console.log("\n========================================");
  console.log(`✅ Done! Captured ${captured.length} API calls.`);
  console.log(`   Saved to: ${OUTPUT_FILE}`);
  console.log("========================================");
  console.log("Still capturing. Press Ctrl+C to stop.\n");

  process.on("SIGINT", () => {
    save();
    console.log(`\nFinal: ${captured.length} API calls -> ${OUTPUT_FILE}`);
    process.exit(0);
  });

  await new Promise(() => {});
})();
