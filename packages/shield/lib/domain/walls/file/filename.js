import { hasTraversal } from "../path-traversal.js";
const EXECUTABLE_EXTENSION = /\.(exe|bat|cmd|com|scr|pif|msi|dll|jar|js|mjs|cjs|vbs|ps1|sh|bash|php|py|rb|pl)$/i;
export function isUnsafeFilename(filename) {
    return hasTraversal(filename) || EXECUTABLE_EXTENSION.test(filename);
}
//# sourceMappingURL=filename.js.map