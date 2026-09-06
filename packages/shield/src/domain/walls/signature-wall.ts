import type { ValueDetector } from "../detector";
import type { Severity, Surface } from "../models";
import { signaturesFor } from "./signatures";

/**
 * Builds a value wall backed by the signature table.
 *
 * The pattern list is resolved once here, not per request. Callers are
 * responsible for enforcing `maxStringLength` before handing a value over.
 */
export function createSignatureWall(
  id: string,
  severity: Severity,
  surfaces: readonly Surface[],
): ValueDetector {
  const patterns = signaturesFor(id);

  return {
    kind: "value",
    id,
    severity,
    surfaces,
    test: (value) => patterns.some((pattern) => pattern.test(value)),
  };
}
