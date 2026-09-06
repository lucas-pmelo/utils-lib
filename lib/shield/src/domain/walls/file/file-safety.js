"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSafetyWall = void 0;
const magic_bytes_1 = require("./magic-bytes");
const filename_1 = require("./filename");
const ID = "file-safety";
function finding(path, sample) {
    return { wallId: ID, severity: "high", surface: "file", path, sample };
}
exports.fileSafetyWall = {
    kind: "file",
    id: ID,
    severity: "high",
    inspect: (file, index, limits) => {
        const findings = [];
        if (index >= limits.maxFiles) {
            findings.push(finding(`file[${index}]`, `more than ${limits.maxFiles} files`));
        }
        if (file.size > limits.maxFileBytes) {
            findings.push(finding(`file[${index}].size`, `${file.size} > ${limits.maxFileBytes}`));
        }
        if ((0, filename_1.isUnsafeFilename)(file.filename)) {
            findings.push(finding(`file[${index}].filename`, "unsafe filename"));
        }
        const actualMimeType = file.head && (0, magic_bytes_1.detectMimeFromMagic)(file.head);
        if (actualMimeType && file.mimeType && actualMimeType !== file.mimeType) {
            findings.push(finding(`file[${index}].mimeType`, `declared ${file.mimeType}, looks like ${actualMimeType}`));
        }
        return findings.length ? findings : null;
    },
};
//# sourceMappingURL=file-safety.js.map