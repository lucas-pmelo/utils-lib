import { type MulterLikeFile } from "./multer-files";
import type { Preset, ShieldOverride } from "../domain/resolve-config";
export interface ExpressLikeRequest {
    headers?: Record<string, string | undefined>;
    query?: Record<string, string | undefined>;
    params?: Record<string, string | undefined>;
    body?: unknown;
    file?: MulterLikeFile;
    files?: MulterLikeFile[] | Record<string, MulterLikeFile[]>;
}
export declare function withShieldExpress(preset: Preset, override?: ShieldOverride): (req: ExpressLikeRequest, next: (error?: unknown) => void) => void;
