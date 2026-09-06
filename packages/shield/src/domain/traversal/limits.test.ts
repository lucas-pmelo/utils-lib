import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./limits.js";

describe("defaultLimits", () => {
  it("should expose a positive cap for every limit", () => {
    for (const value of Object.values(defaultLimits)) {
      expect(value).toBeGreaterThan(0);
    }
  });
});
