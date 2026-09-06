"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignatureWall = createSignatureWall;
const signatures_1 = require("./signatures");
function createSignatureWall(id, severity, surfaces) {
    const patterns = (0, signatures_1.signaturesFor)(id);
    return {
        kind: "value",
        id,
        severity,
        surfaces,
        test: (value) => patterns.some((pattern) => pattern.test(value)),
    };
}
//# sourceMappingURL=signature-wall.js.map