"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathTraversalWall = void 0;
exports.hasTraversal = hasTraversal;
const surfaces_1 = require("./surfaces");
const MARKERS = ["../", "..\\", "%2e%2e", "..%2f", "..%5c", "\0"];
function hasTraversal(value) {
    const haystack = value.toLowerCase();
    return MARKERS.some((marker) => haystack.includes(marker));
}
exports.pathTraversalWall = {
    kind: "value",
    id: "path-traversal",
    severity: "high",
    surfaces: surfaces_1.ALL_SURFACES,
    test: (value) => hasTraversal(value),
};
//# sourceMappingURL=path-traversal.js.map