import type { Detector, ShieldConfig } from "./detector";
import type { Limits } from "./models";
export interface Preset {
    walls: Detector[];
    limits: Limits;
}
export interface ShieldOverride {
    walls?: Detector[];
    limits?: Partial<Limits>;
    disable?: string[];
    add?: Detector[];
}
export declare function resolveConfig(preset: Preset, override?: ShieldOverride): ShieldConfig;
