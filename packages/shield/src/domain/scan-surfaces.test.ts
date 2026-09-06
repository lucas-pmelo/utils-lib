import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./traversal/limits.js";
import { resolveConfig } from "./resolve-config.js";
import { scan } from "./scan.js";
import { defaultWalls } from "./walls/index.js";
import type { ScanSurfaces } from "./models.js";
import type { ShieldConfig } from "./detector.js";

const config: ShieldConfig = resolveConfig({ walls: defaultWalls, limits: defaultLimits });

function scanOf(surfaces: ScanSurfaces) {
  return scan(surfaces, config);
}

/**
 * A query string is not a `Record<string, string>`.
 *
 * Express's `qs` parser hands over arrays and nested objects, and a Fastify
 * schema coerces a param to a number. Treating those as strings threw inside
 * the walls, and `scan`'s fail-closed catch turned every ordinary request with
 * a repeated parameter into a 403.
 */
describe("scan over flat surfaces", () => {
  it.each([
    ["an array value", { tags: ["a", "b"] }],
    ["a nested object value", { f: { x: "1" } }],
    ["a null value", { deleted: null }],
    ["a number coerced by a schema", { page: 2 }],
    ["a boolean", { active: true }],
    ["an undefined value", { missing: undefined }],
  ])("should allow a clean query carrying %s", (_label, query) => {
    expect(scanOf({ query })).toMatchObject({ verdict: "allow", truncated: false });
  });

  it("should still find an attack inside an array query value", () => {
    const result = scanOf({ query: { tags: ["fine", "' OR 1=1 --"] } });

    expect(result.verdict).toBe("block");
    expect(result.findings[0]).toMatchObject({ surface: "query", path: "query.tags[1]" });
  });

  it("should still find an attack nested inside a query object", () => {
    const result = scanOf({ query: { filter: { name: "<script>alert(1)</script>" } } });

    expect(result.findings[0]).toMatchObject({ surface: "query", path: "query.filter.name" });
  });

  it("should report the surface a header finding came from", () => {
    const result = scanOf({ headers: { "x-file": "../../etc/passwd" } });

    expect(result.findings[0]).toMatchObject({ surface: "header", path: "header.x-file" });
  });

  it("should report an oversized flat value against its own surface", () => {
    const result = scanOf({ query: { note: "x".repeat(defaultLimits.maxStringLength + 1) } });

    expect(result.truncated).toBe(true);
    expect(result.findings[0]).toMatchObject({ wallId: "oversized-payload", surface: "query" });
  });

  it("should report an oversized key without running a regex over it", () => {
    const key = "k".repeat(defaultLimits.maxStringLength + 1);

    expect(scanOf({ query: { [key]: "v" } })).toMatchObject({
      verdict: "block",
      truncated: true,
    });
  });

  it("should treat a binary body as a leaf rather than walking it byte by byte", () => {
    const result = scanOf({ body: { upload: new Uint8Array(50_000) } });

    expect(result).toMatchObject({ verdict: "allow", truncated: false });
  });
});

describe("scan failure reporting", () => {
  it("should carry the reason when a wall throws", () => {
    const exploding = {
      kind: "value" as const,
      id: "boom",
      severity: "low" as const,
      surfaces: ["body" as const],
      test: (): boolean => {
        throw new Error("wall exploded");
      },
    };

    const result = scan({ body: { a: "x" } }, resolveConfig({ walls: [exploding], limits: defaultLimits }));

    expect(result).toMatchObject({ verdict: "block", truncated: true });
    expect(result.findings[0]?.sample).toBe("scan failed: wall exploded");
  });

  it("should still fail closed when a wall throws a non-error", () => {
    const exploding = {
      kind: "value" as const,
      id: "boom",
      severity: "low" as const,
      surfaces: ["body" as const],
      test: (): boolean => {
        throw "nope";
      },
    };

    const result = scan({ body: { a: "x" } }, resolveConfig({ walls: [exploding], limits: defaultLimits }));

    expect(result.findings[0]?.sample).toBe("scan failed: unknown");
  });
});
