import type { Detector, ShieldConfig } from "./detector";
import type { Limits } from "./models";
export interface Preset {
    walls: readonly Detector[];
    limits: Limits;
}
export interface ShieldOverride {
    walls?: readonly Detector[];
    limits?: Partial<Limits>;
    disable?: readonly string[];
    add?: readonly Detector[];
}
export declare function resolveConfig(preset: Preset, override?: ShieldOverride): ShieldConfig;
