import type { StructuralDetector } from "../detector";

/** Always hostile as a key. There is no legitimate `__proto__` field. */
const RESERVED_KEY = "__proto__";

/**
 * `qs` and friends leave the bracket path in the key itself, so the polluting
 * name arrives as `__proto__[admin]`. Only the leading name identifies it.
 */
function leadingName(key: string): string {
  const bracket = key.indexOf("[");
  return bracket === -1 ? key : key.slice(0, bracket);
}

/**
 * Reachable only when they carry a nested object — `{ constructor: { ... } }`
 * is the merge-pollution shape, while `{ constructor: "acme" }` is a form field
 * and `{ prototype: "v1" }` is a product record.
 */
const CHAINING_KEYS = new Set(["constructor", "prototype"]);

/**
 * Flags nodes whose key can reach `Object.prototype`.
 *
 * Matches on the key and the *type* of its value, never dereferencing either,
 * so inspecting a hostile payload cannot itself trigger the pollution it is
 * looking for.
 */
export const prototypePollutionWall: StructuralDetector = {
  kind: "structural",
  id: "prototype-pollution",
  severity: "critical",
  inspectNode: (key, value) => {
    const name = leadingName(key);
    return (
      name === RESERVED_KEY ||
      (CHAINING_KEYS.has(name) && typeof value === "object" && value !== null)
    );
  },
};
