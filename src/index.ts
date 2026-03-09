// ── Public API barrel exports ────────────────

// Client
export { RiseUpClient } from "./client/RiseUpClient.js";
export type { RiseUpClientOptions } from "./client/RiseUpClient.js";
export { HttpClient } from "./client/http.js";
export type { HttpClientOptions } from "./client/http.js";

// Types
export type {
  Transaction,
  TrackingCategory,
  MatchingPredicate,
  AiEnrichment,
  Envelope,
  EnvelopeDetails,
  Budget,
  TrackingCategoryMetadata,
  Balance,
  CreditCardDebt,
  Subscription,
  SubscriptionState,
  CredentialsSettings,
  CredentialConfig,
  CredentialAccount,
  Insight,
  Plan,
  SessionData,
  StoredSession,
} from "./client/types.js";

// Auth
export { SessionManager } from "./auth/SessionManager.js";

// Errors
export {
  RiseUpError,
  AuthError,
  ApiError,
  NetworkError,
} from "./utils/errors.js";

// Config utilities
export {
  BASE_URL,
  DEFAULT_COMMIT_HASH,
  getConfigDir,
  getSessionPath,
} from "./utils/config.js";

// Date utilities
export { parseMonth } from "./utils/dates.js";
