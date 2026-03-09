import { BASE_URL } from "../utils/config.js";
import { AuthError, ApiError, NetworkError } from "../utils/errors.js";
import type { SessionManager } from "../auth/SessionManager.js";

export interface HttpClientOptions {
  baseUrl?: string;
  sessionManager: SessionManager;
}

/**
 * Thin wrapper around native `fetch` that:
 *  - injects the required RiseUp headers (COMMIT-HASH, RISEUP-PLATFORM, etc.)
 *  - attaches session cookies
 *  - maps HTTP errors to our error hierarchy
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly session: SessionManager;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.session = options.sessionManager;
  }

  /**
   * Perform a GET request against the RiseUp API.
   *
   * @param path  API path relative to the base URL, e.g. "/api/budget/current"
   * @returns     Parsed JSON body (or raw text for plain-text endpoints).
   */
  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>(path, "GET");
  }

  /**
   * Perform a POST request against the RiseUp API.
   */
  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, "POST", body);
  }

  // ── internal ────────────────────────────────

  private async request<T>(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = await this.buildHeaders();

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        redirect: "follow",
      });
    } catch (err) {
      throw new NetworkError(
        `Network request to ${path} failed: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }

    if (response.status === 401) {
      throw new AuthError(
        `Authentication failed for ${path} (HTTP 401). Please log in again.`,
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new ApiError(
        `API error on ${method} ${path}: ${response.status} ${response.statusText} — ${text}`,
        response.status,
        path,
      );
    }

    // Some endpoints return plain text (e.g. /api/logged-in/ returns "OK")
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const commitHash = await this.session.getCommitHash();
    const cookies = await this.session.getCookies();

    const headers: Record<string, string> = {
      "COMMIT-HASH": commitHash,
      "RISEUP-PLATFORM": "WEB",
      Accept: "application/json",
    };

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    return headers;
  }
}
