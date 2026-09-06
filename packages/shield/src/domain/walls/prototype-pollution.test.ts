import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits";
import { prototypePollutionWall } from "./prototype-pollution";
import type { DetectorContext } from "../detector";

const ctx: DetectorContext = { surface: "body", path: "body.a", limits: defaultLimits };

describe("prototypePollutionWall", () => {
  it("should be a critical structural wall", () => {
    expect(prototypePollutionWall.kind).toBe("structural");
    expect(prototypePollutionWall.id).toBe("prototype-pollution");
    expect(prototypePollutionWall.severity).toBe("critical");
  });

  it.each(["__proto__", "constructor", "prototype"])(
    "should flag the node when the key is %s",
    (key) => {
      expect(prototypePollutionWall.inspectNode(key, {}, ctx)).toBe(true);
    },
  );

  it.each(["name", "proto", "__proto", "Constructor", ""])(
    "should pass the node when the key is %s",
    (key) => {
      expect(prototypePollutionWall.inspectNode(key, {}, ctx)).toBe(false);
    },
  );

  it("should flag the node without dereferencing the polluting key", () => {
    const body = JSON.parse('{"__proto__": {"admin": true}}');
    let flagged = false;

    for (const key of Object.keys(body)) {
      flagged ||= prototypePollutionWall.inspectNode(key, undefined, ctx);
    }

    expect(flagged).toBe(true);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
  });
});

describe("prototypePollutionWall on ordinary field names", () => {
  const ctx: DetectorContext = { surface: "body", path: "body", limits: defaultLimits };

  it.each([
    ["a product record with a prototype field", "prototype", "v1"],
    ["a form field literally named constructor", "constructor", "acme"],
  ])("should pass %s", (_label, key, value) => {
    expect(prototypePollutionWall.inspectNode(key, value, ctx)).toBe(false);
  });

  it.each([
    ["a merge-pollution payload under constructor", "constructor", { prototype: { admin: true } }],
    ["a merge-pollution payload under prototype", "prototype", { admin: true }],
  ])("should flag %s", (_label, key, value) => {
    expect(prototypePollutionWall.inspectNode(key, value, ctx)).toBe(true);
  });

  it("should flag the qs bracket form of the reserved key", () => {
    expect(prototypePollutionWall.inspectNode("__proto__[admin]", "true", ctx)).toBe(true);
  });

  it("should not flag a field whose name merely starts with a bracket path", () => {
    expect(prototypePollutionWall.inspectNode("filters[name]", "Ana", ctx)).toBe(false);
  });
});
