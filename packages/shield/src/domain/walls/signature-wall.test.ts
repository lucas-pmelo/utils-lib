import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits";
import { createSignatureWall } from "./signature-wall";
import type { DetectorContext } from "../detector";

const ctx: DetectorContext = { surface: "body", path: "body.q", limits: defaultLimits };

describe("createSignatureWall", () => {
  it("should build a value wall carrying the given identity", () => {
    const wall = createSignatureWall("sqli", "high", ["body"]);

    expect(wall.kind).toBe("value");
    expect(wall.id).toBe("sqli");
    expect(wall.severity).toBe("high");
    expect(wall.surfaces).toEqual(["body"]);
  });

  it("should pass every value when the wall id has no signatures", () => {
    const wall = createSignatureWall("unknown-wall", "low", ["body"]);

    expect(wall.test("' OR 1=1 --", ctx)).toBe(false);
  });
});
