import { EDGE_SURFACES } from "./surfaces.js";
const MARKERS = ["../", "..\\", "%2e%2e", "..%2f", "..%5c", "\0"];
export function hasTraversal(value) {
    const haystack = value.toLowerCase();
    return MARKERS.some((marker) => haystack.includes(marker));
}
export const pathTraversalWall = {
    kind: "value",
    id: "path-traversal",
    severity: "high",
    surfaces: EDGE_SURFACES,
    test: (value) => hasTraversal(value),
};
//# sourceMappingURL=path-traversal.js.map