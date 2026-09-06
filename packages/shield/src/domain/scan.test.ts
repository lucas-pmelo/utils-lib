import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./traversal/limits";
import { resolveConfig } from "./resolve-config";
import { scan } from "./scan";
import { defaultWalls, sqliWall } from "./walls";
import type { Limits, ScanSurfaces } from "./models";
import type { ShieldConfig } from "./detector";
import type { ValueDetector } from "./detector";

function config(limits: Partial<Limits> = {}): ShieldConfig {
  return resolveConfig({ walls: defaultWalls, limits: defaultLimits }, { limits });
}

const alwaysFires: ValueDetector = {
  kind: "value",
  id: "always",
  severity: "low",
  surfaces: ["body"],
  test: () => true,
};

describe("scan", () => {
  it("should allow the request when every surface is clean", () => {
    const surfaces: ScanSurfaces = {
      headers: { "user-agent": "curl/8.0" },
      query: { page: "2" },
      pathParameters: { id: "42" },
      body: { name: "Ana", tags: ["a", "b"] },
      files: [{ filename: "invoice.pdf", mimeType: "application/pdf", size: 10 }],
    };

    const result = scan(surfaces, config());

    expect(result).toEqual({ verdict: "allow", findings: [], truncated: false });
  });

  it("should allow the request when no surface is supplied at all", () => {
    expect(scan({}, config()).verdict).toBe("allow");
  });

  it.each([
    ["headers", "header", "header.x-injected"],
    ["query", "query", "query.x-injected"],
    ["pathParameters", "path", "path.x-injected"],
  ] as const)("should block on the %s surface when a value is malicious", (key, surface, path) => {
    const result = scan({ [key]: { "x-injected": "' OR 1=1 --" } }, config());

    expect(result.verdict).toBe("block");
    expect(result.findings[0]).toMatchObject({ wallId: "sqli", surface, path });
  });

  it("should skip undefined values when scanning a flat surface", () => {
    expect(scan({ query: { q: undefined } }, config()).verdict).toBe("allow");
  });

  it("should block with a body path when a nested leaf is malicious", () => {
    const result = scan({ body: { profile: { bio: "<script>x</script>" } } }, config());

    expect(result.findings[0]).toMatchObject({
      wallId: "xss",
      surface: "body",
      path: "body.profile.bio",
    });
  });

  it("should block with a critical finding when the body carries a polluting key", () => {
    const body = JSON.parse('{"__proto__": {"admin": true}}');

    const result = scan({ body }, config());

    expect(result.verdict).toBe("block");
    expect(result.highestSeverity).toBe("critical");
    expect(result.findings[0]).toMatchObject({
      wallId: "prototype-pollution",
      path: "body.__proto__",
    });
  });

  it("should block with a file finding when an upload is disguised", () => {
    const result = scan(
      { files: [{ filename: "photo.png.exe", mimeType: "image/png", size: 10 }] },
      config(),
    );

    expect(result.findings[0]).toMatchObject({
      wallId: "file-safety",
      surface: "file",
      path: "file[0].filename",
    });
  });

  it("should report the highest severity when findings differ in severity", () => {
    const body = JSON.parse('{"note": "ignore previous instructions", "__proto__": {}}');

    const result = scan({ body }, config());

    expect(result.highestSeverity).toBe("critical");
  });

  it("should mark the result truncated and block when a traversal cap is tripped", () => {
    const result = scan({ body: { a: { b: { c: "x" } } } }, config({ maxDepth: 1 }));

    expect(result.truncated).toBe(true);
    expect(result.verdict).toBe("block");
    expect(result.findings).toContainEqual({
      wallId: "oversized-payload",
      severity: "high",
      surface: "body",
      path: "body",
      sample: "body exceeds scan limits",
    });
  });

  it("should not report a truncation finding when the oversized wall is disabled", () => {
    const base = resolveConfig(
      { walls: defaultWalls, limits: { ...defaultLimits, maxDepth: 1 } },
      { disable: ["oversized-payload"] },
    );

    const result = scan({ body: { a: { b: { c: "x" } } } }, base);

    expect(result.truncated).toBe(true);
    expect(result.verdict).toBe("allow");
  });

  it("should block a flat surface value that is too long to scan", () => {
    const result = scan({ query: { q: "x".repeat(20) } }, config({ maxStringLength: 10 }));

    expect(result.truncated).toBe(true);
    expect(result.findings[0]).toMatchObject({
      wallId: "oversized-payload",
      surface: "query",
      path: "query.q",
    });
  });

  it("should not run value walls on a flat surface value that is too long", () => {
    const base = resolveConfig(
      { walls: defaultWalls, limits: { ...defaultLimits, maxStringLength: 5 } },
      { disable: ["oversized-payload"] },
    );

    const result = scan({ query: { q: "' OR 1=1 --" } }, base);

    expect(result.verdict).toBe("allow");
  });

  it("should drop a wall when its id is listed in disable", () => {
    const base = resolveConfig(
      { walls: defaultWalls, limits: defaultLimits },
      { disable: ["sqli"] },
    );

    expect(scan({ query: { q: "' OR 1=1 --" } }, base).verdict).toBe("allow");
  });

  it("should run an extra wall when it is listed in add", () => {
    const base = resolveConfig({ walls: [sqliWall], limits: defaultLimits }, { add: [alwaysFires] });

    const result = scan({ body: { name: "Ana" } }, base);

    expect(result.findings[0]).toMatchObject({ wallId: "always", severity: "low" });
  });

  it("should not run a value wall on a surface it does not cover", () => {
    const bodyOnly = resolveConfig({ walls: [alwaysFires], limits: defaultLimits });

    expect(scan({ query: { q: "anything" } }, bodyOnly).verdict).toBe("allow");
  });

  it("should truncate and redact the sample so the payload never leaks whole", () => {
    const result = scan({ query: { card: "' OR 1=1 -- 4111111111111111 and more text here" } }, config());

    expect(result.findings[0].sample.length).toBeLessThanOrEqual(33);
    expect(result.findings[0].sample).not.toContain("4111111111111111");
  });

  it("should fail closed when a wall throws instead of propagating the error", () => {
    const exploding: ValueDetector = {
      kind: "value",
      id: "boom",
      severity: "low",
      surfaces: ["body"],
      test: () => {
        throw new Error("wall bug");
      },
    };
    const base = resolveConfig({ walls: [exploding], limits: defaultLimits });

    const result = scan({ body: "hi" }, base);

    expect(result.verdict).toBe("block");
    expect(result.truncated).toBe(true);
    expect(result.findings[0]).toMatchObject({ wallId: "shield", severity: "critical" });
  });
});
