import { describe, expect, it } from "bun:test";
import { defaultWalls } from "../domain/walls/index.js";
import { batchPreset, internalApiPreset, publicApiPreset, sqsPreset } from "./index.js";
import type { Preset } from "../domain/resolve-config.js";

const presets: Array<[string, Preset]> = [
  ["publicApiPreset", publicApiPreset],
  ["internalApiPreset", internalApiPreset],
  ["batchPreset", batchPreset],
  ["sqsPreset", sqsPreset],
];

describe("presets", () => {
  it.each(presets)("should enable every wall in %s", (_name, preset) => {
    expect(preset.walls.map((w) => w.id).sort()).toEqual(defaultWalls.map((w) => w.id).sort());
  });

  it.each(presets)("should define every limit in %s", (_name, preset) => {
    for (const value of Object.values(preset.limits)) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it("should cap the public preset tighter than the internal one", () => {
    expect(publicApiPreset.limits.maxBodyBytes).toBeLessThan(internalApiPreset.limits.maxBodyBytes);
    expect(publicApiPreset.limits.maxFileBytes).toBeLessThan(internalApiPreset.limits.maxFileBytes);
  });

  it("should give the batch preset the most room for large bodies", () => {
    expect(batchPreset.limits.maxBodyBytes).toBeGreaterThan(internalApiPreset.limits.maxBodyBytes);
    expect(batchPreset.limits.maxNodes).toBeGreaterThan(internalApiPreset.limits.maxNodes);
    expect(batchPreset.limits.maxDepth).toBeGreaterThan(internalApiPreset.limits.maxDepth);
  });

  it("should size the sqs preset to a single queue message and expect no files", () => {
    expect(sqsPreset.limits.maxBodyBytes).toBeLessThanOrEqual(256_000);
    expect(sqsPreset.limits.maxFiles).toBe(1);
  });
});
