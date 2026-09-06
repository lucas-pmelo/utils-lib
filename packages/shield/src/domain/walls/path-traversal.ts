import type { ValueDetector } from "../detector.js";
import { EDGE_SURFACES } from "./surfaces.js";

/** Plain substrings, deliberately not regex — there is nothing here to backtrack. */
const MARKERS = ["../", "..\\", "%2e%2e", "..%2f", "..%5c", "\0"];

/** Shared with the file wall, which checks the same markers in filenames. */
export function hasTraversal(value: string): boolean {
  const haystack = value.toLowerCase();
  return MARKERS.some((marker) => haystack.includes(marker));
}

/**
 * Not mounted on the body: `../` is prose in a changelog or a bug report, while
 * a traversal that matters arrives in a path segment, a query parameter or a
 * filename. Uploads stay covered — `file-safety` checks the same markers in
 * filenames through `isUnsafeFilename`.
 */
export const pathTraversalWall: ValueDetector = {
  kind: "value",
  id: "path-traversal",
  severity: "high",
  surfaces: EDGE_SURFACES,
  test: (value) => hasTraversal(value),
};
