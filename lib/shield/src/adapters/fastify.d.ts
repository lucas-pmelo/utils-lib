import type { Preset, ShieldOverride } from "../domain/resolve-config";
export interface FastifyLikeRequest {
    headers?: Record<string, string | undefined>;
    query?: Record<string, string | undefined>;
    params?: Record<string, string | undefined>;
    body?: unknown;
}
export declare function withShieldFastify(preset: Preset, override?: ShieldOverride): (request: FastifyLikeRequest) => Promise<void>;
