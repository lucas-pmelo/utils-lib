import { defaultWalls } from "../domain/walls/index.js";
import type { Preset } from "../domain/resolve-config.js";

/** Hostile internet. Every wall on, caps deliberately tight. */
export const publicApiPreset: Preset = {
  walls: defaultWalls,
  limits: {
    maxBodyBytes: 256_000,
    maxStringLength: 4_000,
    maxDepth: 10,
    maxNodes: 1_000,
    maxFiles: 5,
    maxFileBytes: 2_000_000,
  },
};
