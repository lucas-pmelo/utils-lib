import { describe, expect, it } from "bun:test";
import * as shield from "./index.js";

describe("package barrel", () => {
  it("should export the core, the presets, the error and every adapter", () => {
    expect(Object.keys(shield).sort()).toEqual(
      [
        "SIGNATURE_TABLE_VERSION",
        "ShieldBlockedError",
        "batchPreset",
        "commandInjectionWall",
        "createSignatureWall",
        "defaultLimits",
        "defaultWalls",
        "fileSafetyWall",
        "internalApiPreset",
        "jailbreakWall",
        "llmWalls",
        "oversizedPayloadWall",
        "pathTraversalWall",
        "promptInjectionWall",
        "prototypePollutionWall",
        "publicApiPreset",
        "resolveConfig",
        "scan",
        "signatures",
        "signaturesFor",
        "sqliWall",
        "sqsPreset",
        "withShieldBun",
        "withShieldElysia",
        "withShieldExpress",
        "withShieldFastify",
        "withShieldLambda",
        "withShieldSqs",
        "xssWall",
      ].sort(),
    );
  });

  it("should block a malicious request end to end through the public entry points", () => {
    const result = shield.scan(
      { query: { q: "' OR 1=1 --" } },
      shield.resolveConfig(shield.publicApiPreset),
    );

    expect(() => {
      throw new shield.ShieldBlockedError(result);
    }).toThrow("Request blocked by shield");
  });
});
