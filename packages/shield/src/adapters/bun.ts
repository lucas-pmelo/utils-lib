import { guard } from "./guard.js";
import { parseBody } from "./parse-body.js";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { resolveConfig } from "../domain/resolve-config.js";
import { MAGIC_HEAD_BYTES } from "../domain/walls/file/magic-bytes.js";
import type { Preset, ShieldOverride } from "../domain/resolve-config.js";
import type { FlatSurface, ScanSurfaces, ScannedFile } from "../domain/models.js";

/**
 * Repeated keys are kept, not collapsed.
 *
 * `Object.fromEntries` keeps only the last value, so `?q=<script>&q=safe`
 * would hand the scanner `safe` while a framework that reads the first
 * occurrence receives the payload.
 */
function collectParams(entries: Iterable<[string, string]>): FlatSurface {
  const collected: FlatSurface = {};

  for (const [key, value] of entries) {
    const existing = collected[key];
    if (existing === undefined) collected[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else collected[key] = [existing, value];
  }

  return collected;
}

async function readMultipart(
  request: Request,
): Promise<{ body: Record<string, string>; files: ScannedFile[] }> {
  const form = await request.formData();
  const body: Record<string, string> = {};
  const files: ScannedFile[] = [];

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

function blockedBySize(sample: string): ShieldBlockedError {
  return new ShieldBlockedError({
    verdict: "block",
    findings: [
      { wallId: "oversized-payload", severity: "high", surface: "body", path: "body", sample },
    ],
    highestSeverity: "high",
    truncated: true,
  });
}

async function readSurfaces(request: Request, maxBodyBytes: number): Promise<ScanSurfaces> {
  const url = new URL(request.url);
  const surfaces: ScanSurfaces = {
    headers: collectParams(request.headers.entries()),
    query: collectParams(url.searchParams.entries()),
  };

  if (!request.body) return surfaces;

  // Checked before the body is read: `text()` and `formData()` buffer the
  // whole payload, so consulting the cap afterwards would be too late to
  // stop a declared 500 MB upload from becoming 500 MB of resident memory.
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

/**
 * Wraps a Bun fetch handler. Async because reading the body is async.
 *
 * A block becomes a 403 response rather than a throw: this wrapper *is* the
 * fetch handler, so an escaping error is a 500 from `Bun.serve`, not the
 * documented 403.
 */
export function withShieldBun(preset: Preset, override?: ShieldOverride) {
  const { limits } = resolveConfig(preset, override);

  return (handler: (request: Request) => Response | Promise<Response>) =>
    async (request: Request): Promise<Response> => {
      try {
        // Cloned so the wrapped handler still gets an unread body. The cast
        // bridges the two structurally identical `Request` types that
        // @types/bun and undici-types both declare.
        const inspectable = request.clone() as unknown as Request;
        guard(await readSurfaces(inspectable, limits.maxBodyBytes), preset, override);
      } catch (error) {
        if (!(error instanceof ShieldBlockedError)) throw error;
        return new Response(JSON.stringify(error.toObject()), {
          status: error.statusCode,
          headers: { "content-type": "application/json" },
        });
      }

      return handler(request);
    };
}
