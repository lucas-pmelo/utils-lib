import type { Limits } from "../models.js";

export interface WalkVisitor {
  /** Called for every visited value, including the root (whose key is ""). */
  onNode(key: string, value: unknown, path: string): void;
  /** Called for string leaves that fit within `maxStringLength`. */
  onLeafString(value: string, path: string): void;
}

export interface WalkOutcome {
  truncated: boolean;
}

/**
 * Single safe pass over a value tree. Collects leaf strings and reports every
 * node so value and structural walls both run in one traversal.
 *
 * Stops at the first tripped cap and reports `truncated`, so an unscannable
 * payload is never mistaken for a clean one.
 *
 * `rootPath` names the surface being walked. Bodies walk as `"body"`; the flat
 * surfaces pass their own name so a finding points at the query string or a
 * header rather than at a body path that does not exist.
 */
export function walk(
  body: unknown,
  limits: Limits,
  visitor: WalkVisitor,
  rootPath = "body",
): WalkOutcome {
  if (body === undefined) return { truncated: false };

  let nodes = 0;
  let bytes = 0;
  let truncated = false;
  const ancestors = new Set<object>();

  function visit(key: string, value: unknown, path: string, depth: number): void {
    if (truncated) return;

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

    if (value === null || typeof value !== "object") return;

    // Binary payloads are leaves, not containers. Walking one would spend a
    // node per byte and trip `maxNodes` on an ordinary upload.
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return;

    if (ancestors.has(value)) {
      truncated = true;
      return;
    }
    ancestors.add(value);

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        visit(String(i), value[i], `${path}[${i}]`, depth + 1);
        if (truncated) break;
      }
    } else {
      for (const childKey of Object.keys(value)) {
        visit(childKey, (value as Record<string, unknown>)[childKey], `${path}.${childKey}`, depth + 1);
        if (truncated) break;
      }
    }

    ancestors.delete(value);
  }

  visit("", body, rootPath, 0);
  return { truncated };
}
