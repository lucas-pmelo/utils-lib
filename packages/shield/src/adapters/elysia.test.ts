import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "../errors/shield-blocked-error";
import { publicApiPreset } from "../presets";
import { withShieldElysia } from "./elysia";

const hook = withShieldElysia(publicApiPreset);

describe("withShieldElysia", () => {
  it("should pass the request through when every surface is clean", () => {
    expect(() =>
      hook({
        headers: { "user-agent": "curl/8.0" },
        query: { page: "2" },
        params: { id: "42" },
        body: { name: "Ana" },
      }),
    ).not.toThrow();
  });

  it("should throw ShieldBlockedError when the body carries an attack", () => {
    expect(() => hook({ body: { bio: "<script>alert(1)</script>" } })).toThrow(ShieldBlockedError);
  });

  it("should throw ShieldBlockedError when a path parameter carries an attack", () => {
    expect(() => hook({ params: { file: "../../etc/passwd" } })).toThrow(ShieldBlockedError);
  });

  it("should pass the request through when the context is empty", () => {
    expect(() => hook({})).not.toThrow();
  });

  it("should honour a per-endpoint override", () => {
    const relaxed = withShieldElysia(publicApiPreset, { disable: ["xss"] });

    expect(() => relaxed({ body: { bio: "<script>alert(1)</script>" } })).not.toThrow();
  });
});
