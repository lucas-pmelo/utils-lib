import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits.js";
import { pathTraversalWall } from "./path-traversal.js";
import type { DetectorContext } from "../detector.js";

const ctx: DetectorContext = { surface: "query", path: "query.file", limits: defaultLimits };

describe("pathTraversalWall", () => {
  it("should be a high-severity value wall covering every surface but the body", () => {
    expect(pathTraversalWall.kind).toBe("value");
    expect(pathTraversalWall.id).toBe("path-traversal");
    expect(pathTraversalWall.severity).toBe("high");
    expect(pathTraversalWall.surfaces).toEqual(["header", "query", "path", "file"]);
  });

  it.each([
    "../../etc/passwd",
    "..\\..\\windows\\system32",
    "%2e%2e/secret",
    "%2E%2E%2Fsecret",
    "uploads/..%2fsecret",
    "file\0.png",
  ])("should flag the value when it contains %j", (value) => {
    expect(pathTraversalWall.test(value, ctx)).toBe(true);
  });

  it.each([
    "invoice.pdf",
    "reports/2026/summary.csv",
    "a..b",
    "path/to/file",
    "",
  ])("should pass the value when it is %j", (value) => {
    expect(pathTraversalWall.test(value, ctx)).toBe(false);
  });
});
