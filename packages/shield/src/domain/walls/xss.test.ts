import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../traversal/limits";
import { xssWall } from "./xss";
import type { DetectorContext } from "../detector";

const ctx: DetectorContext = { surface: "body", path: "body.bio", limits: defaultLimits };

describe("xssWall", () => {
  it("should be a high-severity value wall", () => {
    expect(xssWall.id).toBe("xss");
    expect(xssWall.severity).toBe("high");
  });

  it.each([
    "<script>alert(1)</script>",
    "<SCRIPT SRC=//evil.tld>",
    '<img src=x onerror="steal()">',
    "<iframe src=//evil.tld></iframe>",
    "javascript:alert(1)",
    "<svg/onload=alert(1)>",
    "<object data=//evil.tld>",
    "<embed src=//evil.tld>",
    "document.cookie",
  ])("should flag the value when it is %j", (value) => {
    expect(xssWall.test(value, ctx)).toBe(true);
  });

  it.each([
    "I love scripts and screenplays",
    "5 < 10 and 10 > 5",
    "onerror handling is hard",
    "https://example.com/page",
    "",
  ])("should pass the value when it is %j", (value) => {
    expect(xssWall.test(value, ctx)).toBe(false);
  });
});
