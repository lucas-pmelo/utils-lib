import { describe, expect, it } from "bun:test";
import { SIGNATURE_TABLE_VERSION, signatures, signaturesFor } from "./signatures.js";

/**
 * A group that both contains an unbounded quantifier and is itself repeated
 * unboundedly — the `(a+)+` shape that makes backtracking catastrophic.
 */
const NESTED_QUANTIFIER = /\([^)]*[+*][^)]*\)\s*[+*]|\([^)]*[+*][^)]*\)\{/;

describe("signatures", () => {
  it("should expose a table version so signature updates are traceable", () => {
    expect(SIGNATURE_TABLE_VERSION).toBeGreaterThan(0);
  });

  it("should compile every pattern once at module load", () => {
    for (const signature of signatures) {
      expect(signature.pattern).toBeInstanceOf(RegExp);
    }
    expect(signaturesFor("sqli")).toBe(signaturesFor("sqli"));
  });

  it("should carry no nested quantifier in any pattern", () => {
    const offenders = signatures
      .filter((s) => NESTED_QUANTIFIER.test(s.pattern.source))
      .map((s) => `${s.wallId}: ${s.pattern.source}`);

    expect(offenders).toEqual([]);
  });

  it("should carry no global flag, which would make lastIndex leak between calls", () => {
    for (const signature of signatures) {
      expect(signature.pattern.global).toBe(false);
    }
  });

  it("should match a worst-case-length string in well under a second", () => {
    const adversarial = `${"'or 1=1 union select <script $( ".repeat(300)}x`;

    const started = performance.now();
    for (const signature of signatures) signature.pattern.test(adversarial);
    const elapsed = performance.now() - started;

    expect(elapsed).toBeLessThan(500);
  });

  it("should return an empty list when the wall id is unknown", () => {
    expect(signaturesFor("nope")).toEqual([]);
  });
});
