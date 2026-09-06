"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnsafeFilename = isUnsafeFilename;
const path_traversal_1 = require("../path-traversal");
const EXECUTABLE_EXTENSION = /\.(exe|bat|cmd|com|scr|pif|msi|dll|jar|js|mjs|cjs|vbs|ps1|sh|bash|php|py|rb|pl)$/i;
function isUnsafeFilename(filename) {
    return (0, path_traversal_1.hasTraversal)(filename) || EXECUTABLE_EXTENSION.test(filename);
}
//# sourceMappingURL=filename.js.map