/**
 * Error hierarchy for the RiseUp CLI.
 *
 * RiseUpError (base)
 * ├── AuthError      – authentication / session issues
 * ├── ApiError       – non-2xx responses from the API
 * └── NetworkError   – fetch failures / timeouts
 */

export class RiseUpError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RiseUpError";
  }
}

export class AuthError extends RiseUpError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AuthError";
  }
}

export class ApiError extends RiseUpError {
  readonly statusCode: number;
  readonly endpoint: string;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class NetworkError extends RiseUpError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "NetworkError";
  }
}
