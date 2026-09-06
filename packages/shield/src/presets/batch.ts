import { defaultWalls } from "../domain/walls";
import type { Preset } from "../domain/resolve-config";

/** Large JSON bodies. Same walls, room for depth and node count. */
export const batchPreset: Preset = {
  walls: defaultWalls,
  limits: {
    maxBodyBytes: 20_000_000,
    maxStringLength: 50_000,
    maxDepth: 40,
    maxNodes: 200_000,
    maxFiles: 20,
    maxFileBytes: 20_000_000,
  },
};
