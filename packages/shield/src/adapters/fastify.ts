import { guard } from "./guard.js";
import type { Preset, ShieldOverride } from "../domain/resolve-config.js";
import type { FlatSurface } from "../domain/models.js";

/** The slice of a Fastify request shield reads. */
export interface FastifyLikeRequest {
  headers?: FlatSurface;
  query?: FlatSurface;
  params?: FlatSurface;
  body?: unknown;
}

/** `preHandler` hook. Async so it drops straight into Fastify's hook chain. */
export function withShieldFastify(preset: Preset, override?: ShieldOverride) {
  return async (request: FastifyLikeRequest): Promise<void> => {
    guard(
      {
        headers: request.headers,
        query: request.query,
        pathParameters: request.params,
        body: request.body,
      },
      preset,
      override,
    );
  };
}
