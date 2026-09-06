import { guard } from "./guard";
import { toScannedFiles, type MulterLikeFile } from "./multer-files";
import type { Preset, ShieldOverride } from "../domain/resolve-config";
import type { FlatSurface } from "../domain/models";

/** The slice of an Express request shield reads. */
export interface ExpressLikeRequest {
  headers?: FlatSurface;
  query?: FlatSurface;
  params?: FlatSurface;
  body?: unknown;
  file?: MulterLikeFile;
  files?: MulterLikeFile[] | Record<string, MulterLikeFile[]>;
}

/**
 * Express middleware. A block throws, which Express forwards to the error
 * middleware; a clean request calls `next()`.
 *
 * The response argument is unused but must be declared: Express dispatches
 * non-error middleware as `fn(req, res, next)` and reads the arity, so a
 * two-parameter function receives the response where it expects `next`.
 */
export function withShieldExpress(preset: Preset, override?: ShieldOverride) {
  return (req: ExpressLikeRequest, _res: unknown, next: (error?: unknown) => void): void => {
    guard(
      {
        headers: req.headers,
        query: req.query,
        pathParameters: req.params,
        body: req.body,
        files: toScannedFiles(req.file, req.files),
      },
      preset,
      override,
    );
    next();
  };
}
