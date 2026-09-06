import { defaultWalls } from "../domain/walls/index.js";
import type { Preset } from "../domain/resolve-config.js";

/**
 * Queue messages. Caps match the 256 KB SQS message limit; the SQS adapter only
 * ever builds a body surface, so the walls are body-focused by construction.
 */
export const sqsPreset: Preset = {
  walls: defaultWalls,
  limits: {
    maxBodyBytes: 256_000,
    maxStringLength: 20_000,
    maxDepth: 20,
    maxNodes: 10_000,
    maxFiles: 1,
    maxFileBytes: 256_000,
  },
};
