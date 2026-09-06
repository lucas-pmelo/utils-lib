import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./traversal/limits";
import { resolveConfig } from "./resolve-config";
import { sqliWall, xssWall } from "./walls";
import type { Preset } from "./resolve-config";
import type { ValueDetector } from "./detector";

const preset: Preset = { walls: [sqliWall, xssWall], limits: defaultLimits };

const customWall: ValueDetector = {
  kind: "value",
  id: "custom",
  severity: "low",
  surfaces: ["body"],
  test: () => true,
};

describe("resolveConfig", () => {
  it("should return the preset unchanged when no override is given", () => {
    const config = resolveConfig(preset);

    expect(config.walls).toEqual(preset.walls);
    expect(config.limits).toEqual(defaultLimits);
    expect(config.disable).toBeUndefined();
    expect(config.add).toBeUndefined();
  });

  it("should merge limits per key when the override touches only one of them", () => {
    const config = resolveConfig(preset, { limits: { maxBodyBytes: 50_000_000 } });

    expect(config.limits).toEqual({ ...defaultLimits, maxBodyBytes: 50_000_000 });
  });

  it("should not mutate the preset when an override is applied", () => {
    resolveConfig(preset, { limits: { maxDepth: 1 } });

    expect(preset.limits).toEqual(defaultLimits);
  });

  it("should carry disable and add through to the config", () => {
    const config = resolveConfig(preset, { disable: ["xss"], add: [customWall] });

    expect(config.disable).toEqual(["xss"]);
    expect(config.add).toEqual([customWall]);
  });

  it("should replace the wall list when the override supplies its own", () => {
    const config = resolveConfig(preset, { walls: [sqliWall] });

    expect(config.walls).toEqual([sqliWall]);
  });
});
