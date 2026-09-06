import type { Limits } from "../models";

/**
 * Baseline caps every preset composes from.
 *
 * `maxBodyBytes` and `maxStringLength` count UTF-16 code units, which equals
 * bytes for ASCII. They are a denial-of-service guard, not an accounting
 * figure, so the cheap character count is deliberate.
 */
export const defaultLimits: Limits = {
  maxBodyBytes: 1_000_000,
  maxStringLength: 10_000,
  maxDepth: 20,
  maxNodes: 5_000,
  maxFiles: 10,
  maxFileBytes: 5_000_000,
};
