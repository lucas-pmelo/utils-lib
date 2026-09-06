export interface InvalidParam {
  value: string;
  reason: string;
}

export interface TreatedError {
  reason: string;
  invalidParams?: InvalidParam[];
}

/**
 * Mirrors the error contract of `@lucas-pmelo/handlers`.
 *
 * It is redeclared here rather than imported so shield installs with no
 * dependencies. `withErrorHandler` and `ApiHandler` branch on the `isTreated`
 * flag, not on the class, so a shield error still becomes a 403 for free.
 *
 * Deliberate divergence: `handlers` names this interface `Error`, which shadows
 * the global `Error` inside that module. It is `TreatedError` here. The runtime
 * shape is identical, so the two stay wire-compatible — do not "fix" the name
 * back to match.
 */
export default class ClbError extends Error {
  isTreated: boolean;
  statusCode: number;
  error: TreatedError;

  constructor(error: TreatedError, statusCode: number) {
    super(error.reason);
    this.message = error.reason;
    this.isTreated = true;
    this.statusCode = statusCode;
    this.error = error;
  }

  toObject() {
    return {
      reason: this.error.reason,
      ...(this.error.invalidParams?.length && {
        invalidParams: this.error.invalidParams,
      }),
    };
  }
}
