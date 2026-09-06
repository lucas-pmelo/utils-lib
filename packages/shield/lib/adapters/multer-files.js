import { MAGIC_HEAD_BYTES } from "../domain/walls/file/magic-bytes.js";
function toScannedFile(file) {
    return {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        ...(file.buffer && { head: file.buffer.subarray(0, MAGIC_HEAD_BYTES) }),
    };
}
export function toScannedFiles(single, many) {
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