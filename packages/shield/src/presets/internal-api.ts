import { defaultWalls } from "../domain/walls/index.js";
import type { Preset } from "../domain/resolve-config.js";

/** Trusted callers. Same walls, roomier caps. */
export const internalApiPreset: Preset = {
  walls: defaultWalls,
  limits: {
    maxBodyBytes: 2_000_000,
    maxStringLength: 20_000,
    maxDepth: 20,
    maxNodes: 10_000,
    maxFiles: 20,
    maxFileBytes: 20_000_000,
  },
};
