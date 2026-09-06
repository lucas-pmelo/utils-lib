import type { Preset, ShieldOverride } from "../domain/resolve-config";
export interface ElysiaLikeContext {
    headers?: Record<string, string | undefined>;
    query?: Record<string, string | undefined>;
    params?: Record<string, string | undefined>;
    body?: unknown;
}
export declare function withShieldElysia(preset: Preset, override?: ShieldOverride): (context: ElysiaLikeContext) => void;
