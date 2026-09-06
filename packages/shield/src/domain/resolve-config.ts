import type { Detector, ShieldConfig } from "./detector";
import type { Limits } from "./models";

/** A preset is plain data: the walls it enables and the caps it applies. */
export interface Preset {
  walls: readonly Detector[];
  limits: Limits;
}

/**
 * Per-endpoint override. `limits` merges per key so a caller can bump one cap
 * without restating the rest.
 */
export interface ShieldOverride {
  walls?: readonly Detector[];
  limits?: Partial<Limits>;
  disable?: readonly string[];
  add?: readonly Detector[];
}

export function resolveConfig(preset: Preset, override: ShieldOverride = {}): ShieldConfig {
  return {
    walls: override.walls ?? preset.walls,
    limits: { ...preset.limits, ...override.limits },
    disable: override.disable,
    add: override.add,
  };
}
