import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits.js";
import { sqliWall } from "./sqli.js";
import type { DetectorContext } from "../detector.js";

const ctx: DetectorContext = { surface: "query", path: "query.q", limits: defaultLimits };

describe("sqliWall", () => {
  it("should be a high-severity value wall", () => {
    expect(sqliWall.id).toBe("sqli");
    expect(sqliWall.kind).toBe("value");
    expect(sqliWall.severity).toBe("high");
  });

  it.each([
    "' OR 1=1",
    "admin'--",
    "1 UNION SELECT password FROM users",
    "1 union all select null",
    "'; DROP TABLE users",
    "EXEC xp_cmdshell('dir')",
    "' or 'a'='a",
    "1 AND SLEEP(5)",
  ])("should flag the value when it is %j", (value) => {
    expect(sqliWall.test(value, ctx)).toBe(true);
  });

  it.each([
    "Ana Maria",
    "select a plan from the list below to continue with your order today",
    "O'Brien",
    "price -- discounted",
    "unionized workers",
    "",
  ])("should pass the value when it is %j", (value) => {
    expect(sqliWall.test(value, ctx)).toBe(false);
  });
});
