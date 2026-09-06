import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "./shield-blocked-error.js";
import type { ScanResult } from "../domain/models.js";

const result: ScanResult = {
  verdict: "block",
  findings: [
    { wallId: "sqli", severity: "high", surface: "query", path: "query.q", sample: "' OR 1=1" },
    {
      wallId: "prototype-pollution",
      severity: "critical",
      surface: "body",
      path: "body.__proto__",
      sample: "__proto__",
    },
  ],
  highestSeverity: "critical",
  truncated: false,
};

describe("ShieldBlockedError", () => {
  it("should be a treated 403 so the existing error handler answers Forbidden", () => {
    const error = new ShieldBlockedError(result);

    expect(error.isTreated).toBe(true);
    expect(error.statusCode).toBe(403);
    expect(error).toBeInstanceOf(Error);
  });

  it("should carry the scan result for the caller to log", () => {
    expect(new ShieldBlockedError(result).result).toBe(result);
  });

  it("should list one invalid param per finding when serialized", () => {
    expect(new ShieldBlockedError(result).toObject()).toEqual({
      reason: "Request blocked by shield",
      invalidParams: [
        { value: "query:query.q", reason: "sqli" },
        { value: "body:body.__proto__", reason: "prototype-pollution" },
      ],
    });
  });

  it("should never leak the matched sample in the serialized body", () => {
    const serialized = JSON.stringify(new ShieldBlockedError(result).toObject());

    expect(serialized).not.toContain("OR 1=1");
  });

  it("should omit invalidParams when there are no findings", () => {
    const empty: ScanResult = { verdict: "block", findings: [], truncated: true };

    expect(new ShieldBlockedError(empty).toObject()).toEqual({
      reason: "Request blocked by shield",
    });
  });
});
