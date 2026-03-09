// Re-export public API for convenience
export { RiseUpClient } from "./client/RiseUpClient.js";
export type { RiseUpClientOptions } from "./client/RiseUpClient.js";
export { SessionManager } from "./auth/SessionManager.js";
export { HttpClient } from "./client/http.js";
export {
  RiseUpError,
  AuthError,
  ApiError,
  NetworkError,
} from "./utils/errors.js";
export * from "./client/types.js";
export { BASE_URL, DEFAULT_COMMIT_HASH, getConfigDir, getSessionPath } from "./utils/config.js";
