import { hasTraversal } from "../path-traversal";

/**
 * Extensions that execute. Matched at the end of the name, which covers both
 * `installer.exe` and the double-extension disguise `invoice.pdf.exe`.
 */
const EXECUTABLE_EXTENSION =
  /\.(exe|bat|cmd|com|scr|pif|msi|dll|jar|js|mjs|cjs|vbs|ps1|sh|bash|php|py|rb|pl)$/i;

export function isUnsafeFilename(filename: string): boolean {
  return hasTraversal(filename) || EXECUTABLE_EXTENSION.test(filename);
}
