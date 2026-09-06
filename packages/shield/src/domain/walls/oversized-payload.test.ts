import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits";
import { oversizedPayloadWall } from "./oversized-payload";
import type { DetectorContext } from "../detector";

function ctx(maxStringLength: number): DetectorContext {
  return { surface: "body", path: "body.a", limits: { ...defaultLimits, maxStringLength } };
}

describe("oversizedPayloadWall", () => {
  it("should be a high-severity structural wall", () => {
    expect(oversizedPayloadWall.kind).toBe("structural");
    expect(oversizedPayloadWall.id).toBe("oversized-payload");
    expect(oversizedPayloadWall.severity).toBe("high");
  });

  it("should flag the node when a string leaf is longer than maxStringLength", () => {
    expect(oversizedPayloadWall.inspectNode("a", "x".repeat(11), ctx(10))).toBe(true);
  });

  it("should pass the node when a string leaf is exactly at maxStringLength", () => {
    expect(oversizedPayloadWall.inspectNode("a", "x".repeat(10), ctx(10))).toBe(false);
  });

  it("should pass the node when the value is not a string", () => {
    expect(oversizedPayloadWall.inspectNode("a", { deep: true }, ctx(1))).toBe(false);
  });
});
