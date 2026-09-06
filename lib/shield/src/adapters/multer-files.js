"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toScannedFiles = toScannedFiles;
const MAGIC_HEAD_BYTES = 64;
function toScannedFile(file) {
    return Object.assign({ filename: file.originalname, mimeType: file.mimetype, size: file.size }, (file.buffer && { head: file.buffer.subarray(0, MAGIC_HEAD_BYTES) }));
}
function toScannedFiles(single, many) {
    const uploads = [];
    if (single)
        uploads.push(single);
    if (Array.isArray(many))
        uploads.push(...many);
    else if (many)
        uploads.push(...Object.values(many).flat());
    return uploads.length ? uploads.map(toScannedFile) : undefined;
}
//# sourceMappingURL=multer-files.js.map