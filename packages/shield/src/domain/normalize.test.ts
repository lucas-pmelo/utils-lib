import { describe, expect, it } from "bun:test";
import { decodedVariants } from "./normalize";

describe("decodedVariants", () => {
  it("should return the value untouched when there is nothing to normalize", () => {
    expect(decodedVariants("hello world")).toEqual(["hello world"]);
  });

  it("should add each successive percent-decoding", () => {
    expect(decodedVariants("%252e%252e")).toEqual(["%252e%252e", "%2e%2e", ".."]);
  });

  it("should stop at a malformed escape instead of throwing", () => {
    expect(decodedVariants("100%20off%zz")).toEqual(["100%20off%zz"]);
  });

  it("should stop decoding once the value stops changing", () => {
    const variants = decodedVariants("%2525252525252e");

    expect(variants.length).toBeLessThanOrEqual(4);
  });

  it("should add a form with sql block comments stripped", () => {
    expect(decodedVariants("UNION/**/SELECT")).toEqual(["UNION/**/SELECT", "UNION SELECT"]);
  });

  it("should strip sql comments from a decoded form as well as the raw one", () => {
    expect(decodedVariants("UNION%2F**%2FSELECT")).toContain("UNION SELECT");
  });

  it("should not add a stripped form when the comment never closes", () => {
    expect(decodedVariants("a /* unclosed")).toEqual(["a /* unclosed"]);
  });
});
