import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./traversal/limits.js";
import { resolveConfig } from "./resolve-config.js";
import { scan } from "./scan.js";
import { defaultWalls } from "./walls/index.js";
import type { ScanSurfaces } from "./models.js";
import type { ShieldConfig } from "./detector.js";

const config: ShieldConfig = resolveConfig({ walls: defaultWalls, limits: defaultLimits });

function verdictOf(surfaces: ScanSurfaces): string {
  return scan(surfaces, config).verdict;
}

/**
 * Evasion suite. Each case is a payload that reaches the same sink as one the
 * suite already blocks, dressed up in a way an attacker reaches for first.
 * A wall that only stops the textbook spelling of an attack is not a wall.
 */
describe("scan evasion", () => {
  describe("object keys as a smuggling surface", () => {
    it("should block when a sqli payload sits in a body object key", () => {
      expect(verdictOf({ body: { "' OR 1=1 --": "x" } })).toBe("block");
    });

    it("should block when an xss payload sits in a body object key", () => {
      expect(verdictOf({ body: { "<script>alert(1)</script>": "x" } })).toBe("block");
    });

    it("should block when a payload sits in a key nested deep in the body", () => {
      expect(verdictOf({ body: { filters: [{ "1 UNION SELECT password": true }] } })).toBe("block");
    });
  });

  describe("prototype pollution outside the body", () => {
    it("should block a polluting key arriving on the query surface", () => {
      const query = JSON.parse('{"__proto__":"true"}');

      expect(verdictOf({ query })).toBe("block");
    });

    it("should block the qs bracket form of a polluting query key", () => {
      expect(verdictOf({ query: { "__proto__[admin]": "true" } })).toBe("block");
    });
  });

  describe("percent-encoding", () => {
    it("should block a double-encoded traversal payload", () => {
      expect(verdictOf({ query: { file: "%252e%252e%252fetc%252fpasswd" } })).toBe("block");
    });

    it("should block a percent-encoded xss payload on a surface nothing decodes", () => {
      expect(verdictOf({ headers: { "x-note": "%3Cscript%3Ealert(1)%3C/script%3E" } })).toBe(
        "block",
      );
    });
  });

  describe("sql comment obfuscation", () => {
    it("should block a union select split by an inline sql comment", () => {
      expect(verdictOf({ query: { q: "1 UNION/**/SELECT password FROM users" } })).toBe("block");
    });

    it("should block a union select split by a newline", () => {
      expect(verdictOf({ query: { q: "1 UNION\nSELECT password FROM users" } })).toBe("block");
    });
  });
});
