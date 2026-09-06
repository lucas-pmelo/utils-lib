import type { Surface } from "../models.js";

export const ALL_SURFACES: readonly Surface[] = ["header", "query", "path", "body", "file"];

/**
 * Everything but the body.
 *
 * Some walls match shapes that are hostile in a header, a query parameter or a
 * filename, but ordinary prose in a free-text field — a support ticket that
 * says `see ../src/index.ts` is not an attack.
 */
export const EDGE_SURFACES: readonly Surface[] = ["header", "query", "path", "file"];
