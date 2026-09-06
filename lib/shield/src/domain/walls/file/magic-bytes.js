"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMimeFromMagic = detectMimeFromMagic;
const SIGNATURES = [
    { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
    { mimeType: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
    { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
    { mimeType: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
    { mimeType: "application/gzip", bytes: [0x1f, 0x8b] },
    { mimeType: "application/x-msdownload", bytes: [0x4d, 0x5a] },
    { mimeType: "application/x-elf", bytes: [0x7f, 0x45, 0x4c, 0x46] },
];
function detectMimeFromMagic(head) {
    var _a;
    return (_a = SIGNATURES.find((signature) => head.length >= signature.bytes.length &&
        signature.bytes.every((byte, index) => head[index] === byte))) === null || _a === void 0 ? void 0 : _a.mimeType;
}
//# sourceMappingURL=magic-bytes.js.map