import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { publicApiPreset } from "../presets/index.js";
import { withShieldFastify } from "./fastify.js";

const hook = withShieldFastify(publicApiPreset);

describe("withShieldFastify", () => {
  it("should resolve when every surface is clean", async () => {
    await expect(
      hook({ headers: { accept: "application/json" }, body: { name: "Ana" } }),
    ).resolves.toBeUndefined();
  });

  it("should reject with ShieldBlockedError when a header carries an attack", async () => {
    await expect(hook({ headers: { "x-file": "../../etc/passwd" } })).rejects.toThrow(
      ShieldBlockedError,
    );
  });

  it("should reject with ShieldBlockedError when a route param carries an attack", async () => {
    await expect(hook({ params: { q: "'; DROP TABLE users" } })).rejects.toThrow(ShieldBlockedError);
  });

  it("should honour a per-endpoint override", async () => {
    const relaxed = withShieldFastify(publicApiPreset, { disable: ["sqli"] });

    await expect(relaxed({ params: { q: "'; DROP TABLE users" } })).resolves.toBeUndefined();
  });
});
