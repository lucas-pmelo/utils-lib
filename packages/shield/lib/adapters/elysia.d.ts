import type { Preset, ShieldOverride } from "../domain/resolve-config.js";
import type { FlatSurface } from "../domain/models.js";
export interface ElysiaLikeContext {
    headers?: FlatSurface;
    query?: FlatSurface;
    params?: FlatSurface;
    body?: unknown;
}
export declare function withShieldElysia(preset: Preset, override?: ShieldOverride): (context: ElysiaLikeContext) => void;
