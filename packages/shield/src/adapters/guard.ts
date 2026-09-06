import ShieldBlockedError from "../errors/shield-blocked-error";
import { resolveConfig } from "../domain/resolve-config";
import { scan } from "../domain/scan";
import type { Preset, ShieldOverride } from "../domain/resolve-config";
import type { ScanSurfaces } from "../domain/models";

/**
 * The one place an adapter turns a verdict into control flow.
 *
 * Every adapter builds `ScanSurfaces` for its runtime and calls this; the
 * scanning policy lives in the core, not in six copies.
 */
export function guard(
  surfaces: ScanSurfaces,
  preset: Preset,
  override?: ShieldOverride,
): void {
  const result = scan(surfaces, resolveConfig(preset, override));
  if (result.verdict === "block") throw new ShieldBlockedError(result);
}
