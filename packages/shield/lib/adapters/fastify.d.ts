import type { Preset, ShieldOverride } from "../domain/resolve-config";
import type { FlatSurface } from "../domain/models";
export interface FastifyLikeRequest {
    headers?: FlatSurface;
    query?: FlatSurface;
    params?: FlatSurface;
    body?: unknown;
}
export declare function withShieldFastify(preset: Preset, override?: ShieldOverride): (request: FastifyLikeRequest) => Promise<void>;
