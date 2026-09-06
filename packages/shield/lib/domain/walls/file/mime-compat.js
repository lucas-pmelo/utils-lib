const ALIASES = new Map([
    ["image/jpg", "image/jpeg"],
    ["image/pjpeg", "image/jpeg"],
    ["application/x-zip", "application/zip"],
    ["application/x-zip-compressed", "application/zip"],
    ["application/x-gzip", "application/gzip"],
]);
const ZIP_CONTAINERS = /^application\/(vnd\.openxmlformats-officedocument\.|vnd\.oasis\.opendocument\.|java-archive|epub\+zip|vnd\.android\.package-archive|x-ipynb\+json)/i;
function canonical(mimeType) {
    const bare = mimeType.split(";")[0].trim().toLowerCase();
    return ALIASES.get(bare) ?? bare;
}
export function isMimeCompatible(declared, detected) {
    const declaredType = canonical(declared);
    if (declaredType === detected)
        return true;
    return detected === "application/zip" && ZIP_CONTAINERS.test(declaredType);
}
//# sourceMappingURL=mime-compat.js.map