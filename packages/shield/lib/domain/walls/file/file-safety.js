import { detectMimeFromMagic } from "./magic-bytes.js";
import { isMimeCompatible } from "./mime-compat.js";
import { isUnsafeFilename } from "./filename.js";
const ID = "file-safety";
function finding(path, sample) {
    return { wallId: ID, severity: "high", surface: "file", path, sample };
}
export const fileSafetyWall = {
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
        if (isUnsafeFilename(file.filename)) {
            findings.push(finding(`file[${index}].filename`, "unsafe filename"));
        }
        const actualMimeType = file.head && detectMimeFromMagic(file.head);
        if (actualMimeType && file.mimeType && !isMimeCompatible(file.mimeType, actualMimeType)) {
            findings.push(finding(`file[${index}].mimeType`, `declared ${file.mimeType}, looks like ${actualMimeType}`));
        }
        return findings.length ? findings : null;
    },
};
//# sourceMappingURL=file-safety.js.map