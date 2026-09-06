import { guard } from "./guard.js";
import { parseBody } from "./parse-body.js";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { resolveConfig } from "../domain/resolve-config.js";
import { MAGIC_HEAD_BYTES } from "../domain/walls/file/magic-bytes.js";
function collectParams(entries) {
    const collected = {};
    for (const [key, value] of entries) {
        const existing = collected[key];
        if (existing === undefined)
            collected[key] = value;
        else if (Array.isArray(existing))
            existing.push(value);
        else
            collected[key] = [existing, value];
    }
    return collected;
}
async function readMultipart(request) {
    const form = await request.formData();
    const body = {};
    const files = [];
    for (const [key, value] of form.entries()) {
        if (typeof value === "string") {
            body[key] = value;
            continue;
        }
        files.push({
            filename: value.name,
            mimeType: value.type || undefined,
            size: value.size,
            head: new Uint8Array(await value.slice(0, MAGIC_HEAD_BYTES).arrayBuffer()),
        });
    }
    return { body, files };
}
function blockedBySize(sample) {
    return new ShieldBlockedError({
        verdict: "block",
        findings: [
            { wallId: "oversized-payload", severity: "high", surface: "body", path: "body", sample },
        ],
        highestSeverity: "high",
        truncated: true,
    });
}
async function readSurfaces(request, maxBodyBytes) {
    const url = new URL(request.url);
    const surfaces = {
        headers: collectParams(request.headers.entries()),
        query: collectParams(url.searchParams.entries()),
    };
    if (!request.body)
        return surfaces;
    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
        throw blockedBySize(`content-length exceeds ${maxBodyBytes}`);
    }
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
        const { body, files } = await readMultipart(request);
        return { ...surfaces, body, files };
    }
    return { ...surfaces, body: parseBody(await request.text()) };
}
export function withShieldBun(preset, override) {
    const { limits } = resolveConfig(preset, override);
    return (handler) => async (request) => {
        try {
            const inspectable = request.clone();
            guard(await readSurfaces(inspectable, limits.maxBodyBytes), preset, override);
        }
        catch (error) {
            if (!(error instanceof ShieldBlockedError))
                throw error;
            return new Response(JSON.stringify(error.toObject()), {
                status: error.statusCode,
                headers: { "content-type": "application/json" },
            });
        }
        return handler(request);
    };
}
//# sourceMappingURL=bun.js.map