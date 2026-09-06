const MAX_DECODE_PASSES = 3;
const SQL_BLOCK_COMMENT = /\/\*[\s\S]{0,4096}?\*\//g;
function percentDecodings(value) {
    if (!value.includes("%"))
        return [];
    const decodings = [];
    let current = value;
    for (let pass = 0; pass < MAX_DECODE_PASSES; pass++) {
        if (!current.includes("%"))
            break;
        let next;
        try {
            next = decodeURIComponent(current);
        }
        catch {
            break;
        }
        if (next === current)
            break;
        decodings.push(next);
        current = next;
    }
    return decodings;
}
export function decodedVariants(value) {
    const variants = [value, ...percentDecodings(value)];
    for (const variant of [...variants]) {
        if (!variant.includes("/*"))
            continue;
        const stripped = variant.replace(SQL_BLOCK_COMMENT, " ");
        if (stripped !== variant)
            variants.push(stripped);
    }
    return variants;
}
//# sourceMappingURL=normalize.js.map