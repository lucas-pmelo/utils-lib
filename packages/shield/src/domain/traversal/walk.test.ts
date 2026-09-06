import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./limits.js";
import { walk, type WalkVisitor } from "./walk.js";
import type { Limits } from "../models.js";

function collect() {
  const strings: Array<{ value: string; path: string }> = [];
  const nodes: Array<{ key: string; value: unknown; path: string }> = [];
  const visitor: WalkVisitor = {
    onLeafString: (value, path) => strings.push({ value, path }),
    onNode: (key, value, path) => nodes.push({ key, value, path }),
  };
  return { strings, nodes, visitor };
}

function limitsWith(overrides: Partial<Limits>): Limits {
  return { ...defaultLimits, ...overrides };
}

describe("walk", () => {
  it("should visit a root string leaf when the body is a bare string", () => {
    const { strings, visitor } = collect();

    const outcome = walk("hello", defaultLimits, visitor);

    expect(strings).toEqual([{ value: "hello", path: "body" }]);
    expect(outcome.truncated).toBe(false);
  });

  it("should build dotted paths when the body has nested objects", () => {
    const { strings, visitor } = collect();

    walk({ user: { name: "ana" } }, defaultLimits, visitor);

    expect(strings).toEqual([{ value: "ana", path: "body.user.name" }]);
  });

  it("should build indexed paths when the body has arrays", () => {
    const { strings, visitor } = collect();

    walk({ items: ["a", "b"] }, defaultLimits, visitor);

    expect(strings.map((s) => s.path)).toEqual(["body.items[0]", "body.items[1]"]);
  });

  it("should report every node with its key when walking an object", () => {
    const { nodes, visitor } = collect();

    walk({ a: 1 }, defaultLimits, visitor);

    expect(nodes).toEqual([
      { key: "", value: { a: 1 }, path: "body" },
      { key: "a", value: 1, path: "body.a" },
    ]);
  });

  it("should report inherited-name keys as own keys when the body carries them", () => {
    const { nodes, visitor } = collect();
    const body = JSON.parse('{"__proto__": {"admin": true}}');

    walk(body, defaultLimits, visitor);

    expect(nodes.map((n) => n.key)).toContain("__proto__");
  });

  it("should skip non-string primitives when collecting leaf strings", () => {
    const { strings, visitor } = collect();

    walk({ n: 1, b: true, z: null, u: undefined }, defaultLimits, visitor);

    expect(strings).toEqual([]);
  });

  it("should truncate when nesting is deeper than maxDepth", () => {
    const { strings, visitor } = collect();
    const body = { a: { b: { c: "deep" } } };

    const outcome = walk(body, limitsWith({ maxDepth: 2 }), visitor);

    expect(outcome.truncated).toBe(true);
    expect(strings).toEqual([]);
  });

  it("should not truncate when nesting is exactly at maxDepth", () => {
    const { strings, visitor } = collect();

    const outcome = walk({ a: { b: "ok" } }, limitsWith({ maxDepth: 2 }), visitor);

    expect(outcome.truncated).toBe(false);
    expect(strings).toEqual([{ value: "ok", path: "body.a.b" }]);
  });

  it("should truncate when the node count exceeds maxNodes", () => {
    const { visitor } = collect();

    const outcome = walk({ a: 1, b: 2, c: 3 }, limitsWith({ maxNodes: 2 }), visitor);

    expect(outcome.truncated).toBe(true);
  });

  it("should truncate when accumulated string size exceeds maxBodyBytes", () => {
    const { visitor } = collect();

    const outcome = walk({ a: "1234", b: "5678" }, limitsWith({ maxBodyBytes: 5 }), visitor);

    expect(outcome.truncated).toBe(true);
  });

  it("should truncate and skip the value when a leaf string exceeds maxStringLength", () => {
    const { strings, nodes, visitor } = collect();
    const long = "x".repeat(50);

    const outcome = walk({ a: long }, limitsWith({ maxStringLength: 10 }), visitor);

    expect(outcome.truncated).toBe(true);
    expect(strings).toEqual([]);
    expect(nodes.map((n) => n.key)).toContain("a");
  });

  it("should truncate when the body contains a cycle", () => {
    const { visitor } = collect();
    const body: Record<string, unknown> = { name: "root" };
    body.self = body;

    const outcome = walk(body, defaultLimits, visitor);

    expect(outcome.truncated).toBe(true);
  });

  it("should not truncate when the same object appears twice without a cycle", () => {
    const { visitor } = collect();
    const shared = { name: "ana" };

    const outcome = walk({ a: shared, b: shared }, defaultLimits, visitor);

    expect(outcome.truncated).toBe(false);
  });

  it("should visit nothing when the body is undefined", () => {
    const { nodes, visitor } = collect();

    const outcome = walk(undefined, defaultLimits, visitor);

    expect(nodes).toEqual([]);
    expect(outcome.truncated).toBe(false);
  });
});
