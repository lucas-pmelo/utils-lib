import { signaturesFor } from "./signatures";
export function createSignatureWall(id, severity, surfaces) {
    const patterns = signaturesFor(id);
    return {
        kind: "value",
        id,
        severity,
        surfaces,
        test: (value) => patterns.some((pattern) => pattern.test(value)),
    };
}
//# sourceMappingURL=signature-wall.js.map