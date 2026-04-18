// Typed error hierarchy thrown by the shared API client. Feature pages catch
// these -- not raw Response objects -- so we can render consistent UIs (sign-in
// prompt, upgrade banner, rate-limit notice, etc.) without each page
// re-implementing HTTP status dispatch.

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: unknown;
  readonly path?: string;

  constructor(
    message: string,
    opts: { status: number; code?: string; detail?: unknown; path?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.detail = opts.detail;
    this.path = opts.path;
  }
}

export class AuthError extends ApiError {
  constructor(message = "Authentication required", opts: Partial<ConstructorParameters<typeof ApiError>[1]> = {}) {
    super(message, { status: opts.status ?? 401, code: opts.code, detail: opts.detail, path: opts.path });
    this.name = "AuthError";
  }
}

export class FeatureGatedError extends ApiError {
  readonly feature?: string;
  readonly upgradeUrl?: string;

  constructor(
    message = "This feature is not available on your current plan.",
    opts: Partial<ConstructorParameters<typeof ApiError>[1]> & { feature?: string; upgradeUrl?: string } = {},
  ) {
    super(message, { status: opts.status ?? 402, code: opts.code, detail: opts.detail, path: opts.path });
    this.name = "FeatureGatedError";
    this.feature = opts.feature;
    this.upgradeUrl = opts.upgradeUrl;
  }
}

export class RateLimitError extends ApiError {
  readonly retryAfterSec?: number;

  constructor(
    message = "Too many requests. Please slow down.",
    opts: Partial<ConstructorParameters<typeof ApiError>[1]> & { retryAfterSec?: number } = {},
  ) {
    super(message, { status: opts.status ?? 429, code: opts.code, detail: opts.detail, path: opts.path });
    this.name = "RateLimitError";
    this.retryAfterSec = opts.retryAfterSec;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found", opts: Partial<ConstructorParameters<typeof ApiError>[1]> = {}) {
    super(message, { status: opts.status ?? 404, code: opts.code, detail: opts.detail, path: opts.path });
    this.name = "NotFoundError";
  }
}

export function isFeatureGatedError(e: unknown): e is FeatureGatedError {
  return e instanceof FeatureGatedError;
}

export function isAuthError(e: unknown): e is AuthError {
  return e instanceof AuthError;
}
