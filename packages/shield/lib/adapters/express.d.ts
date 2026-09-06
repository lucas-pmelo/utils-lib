import { type MulterLikeFile } from "./multer-files.js";
import type { Preset, ShieldOverride } from "../domain/resolve-config.js";
import type { FlatSurface } from "../domain/models.js";
export interface ExpressLikeRequest {
    headers?: FlatSurface;
    query?: FlatSurface;
    params?: FlatSurface;
    body?: unknown;
    file?: MulterLikeFile;
    files?: MulterLikeFile[] | Record<string, MulterLikeFile[]>;
}
export declare function withShieldExpress(preset: Preset, override?: ShieldOverride): (req: ExpressLikeRequest, _res: unknown, next: (error?: unknown) => void) => void;
