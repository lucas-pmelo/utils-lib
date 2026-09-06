import { guard } from "./guard";
import type { Preset, ShieldOverride } from "../domain/resolve-config";
import type { FlatSurface } from "../domain/models";

/** The slice of an Elysia context shield reads. Structural, so Elysia stays out of the deps. */
export interface ElysiaLikeContext {
  headers?: FlatSurface;
  query?: FlatSurface;
  params?: FlatSurface;
  body?: unknown;
}

/**
 * `beforeHandle` hook. A block throws `ShieldBlockedError`, which the existing
 * `withErrorHandler` turns into a 403.
 */
export function withShieldElysia(preset: Preset, override?: ShieldOverride) {
  return (context: ElysiaLikeContext): void => {
    guard(
      {
        headers: context.headers,
        query: context.query,
        pathParameters: context.params,
        body: context.body,
      },
      preset,
      override,
    );
  };
}
