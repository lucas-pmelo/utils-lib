import ClbError from "./clb-error";
import type { ScanResult } from "../domain/models";

/**
 * Thrown by every adapter when a scan returns `block`.
 *
 * The serialized body names the wall and the surface that tripped, never the
 * matched slice — `sample` stays on `result` for logging only.
 */
export default class ShieldBlockedError extends ClbError {
  readonly result: ScanResult;

  constructor(result: ScanResult) {
    super(
      {
        reason: "Request blocked by shield",
        invalidParams: result.findings.map((finding) => ({
          value: `${finding.surface}:${finding.path}`,
          reason: finding.wallId,
        })),
      },
      403,
    );
    this.result = result;
  }
}
