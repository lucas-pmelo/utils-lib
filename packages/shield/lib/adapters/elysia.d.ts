import type { Preset, ShieldOverride } from "../domain/resolve-config";
import type { FlatSurface } from "../domain/models";
export interface ElysiaLikeContext {
    headers?: FlatSurface;
    query?: FlatSurface;
    params?: FlatSurface;
    body?: unknown;
}
export declare function withShieldElysia(preset: Preset, override?: ShieldOverride): (context: ElysiaLikeContext) => void;
