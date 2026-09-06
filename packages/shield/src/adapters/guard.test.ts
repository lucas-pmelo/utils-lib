import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { guard } from "./guard.js";
import { publicApiPreset } from "../presets/index.js";

describe("guard", () => {
  it("should return quietly when the surfaces are clean", () => {
    expect(() => guard({ body: { name: "Ana" } }, publicApiPreset)).not.toThrow();
  });

  it("should throw ShieldBlockedError when a surface is malicious", () => {
    expect(() => guard({ query: { q: "' OR 1=1 --" } }, publicApiPreset)).toThrow(
      ShieldBlockedError,
    );
  });

  it("should apply the override when it disables the offending wall", () => {
    expect(() =>
      guard({ query: { q: "' OR 1=1 --" } }, publicApiPreset, { disable: ["sqli"] }),
    ).not.toThrow();
  });

  it("should apply the override when it raises a limit", () => {
    const big = { note: "x".repeat(5_000) };

    expect(() => guard({ body: big }, publicApiPreset)).toThrow(ShieldBlockedError);
    expect(() =>
      guard({ body: big }, publicApiPreset, { limits: { maxStringLength: 10_000 } }),
    ).not.toThrow();
  });

  it("should carry the findings on the thrown error", () => {
    try {
      guard({ query: { q: "' OR 1=1 --" } }, publicApiPreset);
      throw new Error("expected a block");
    } catch (error) {
      expect((error as ShieldBlockedError).result.findings[0].wallId).toBe("sqli");
    }
  });
});
