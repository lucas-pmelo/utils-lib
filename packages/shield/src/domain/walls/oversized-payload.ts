import type { StructuralDetector } from "../detector.js";

/**
 * Reports payloads that cannot be scanned safely.
 *
 * Catches over-long string leaves here, and `scan` raises the same wall when
 * the traversal trips a depth, node or total-size cap. An unscannable payload
 * is treated as hostile rather than waved through.
 */
export const oversizedPayloadWall: StructuralDetector = {
  kind: "structural",
  id: "oversized-payload",
  severity: "high",
  inspectNode: (_key, value, ctx) =>
    typeof value === "string" && value.length > ctx.limits.maxStringLength,
};
