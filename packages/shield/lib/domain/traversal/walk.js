export function walk(body, limits, visitor, rootPath = "body") {
    if (body === undefined)
        return { truncated: false };
    let nodes = 0;
    let bytes = 0;
    let truncated = false;
    const ancestors = new Set();
    function visit(key, value, path, depth) {
        if (truncated)
            return;
        if (depth > limits.maxDepth || ++nodes > limits.maxNodes) {
            truncated = true;
            return;
        }
        visitor.onNode(key, value, path);
        if (typeof value === "string") {
            if (value.length > limits.maxStringLength) {
                truncated = true;
                return;
            }
            bytes += value.length;
            if (bytes > limits.maxBodyBytes) {
                truncated = true;
                return;
            }
            visitor.onLeafString(value, path);
            return;
        }
        if (value === null || typeof value !== "object")
            return;
        if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer)
            return;
        if (ancestors.has(value)) {
            truncated = true;
            return;
        }
        ancestors.add(value);
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                visit(String(i), value[i], `${path}[${i}]`, depth + 1);
                if (truncated)
                    break;
            }
        }
        else {
            for (const childKey of Object.keys(value)) {
                visit(childKey, value[childKey], `${path}.${childKey}`, depth + 1);
                if (truncated)
                    break;
            }
        }
        ancestors.delete(value);
    }
    visit("", body, rootPath, 0);
    return { truncated };
}
//# sourceMappingURL=walk.js.map