import { guard } from "./guard.js";
import { parseBody } from "./parse-body.js";
import type { Preset, ShieldOverride } from "../domain/resolve-config.js";
import type { FlatSurface } from "../domain/models.js";

/** The slice of an API Gateway event shield reads. */
export interface ApiGatewayLikeEvent {
  headers?: FlatSurface;
  queryStringParameters?: FlatSurface | null;
  pathParameters?: FlatSurface | null;
  body?: string | null;
  isBase64Encoded?: boolean;
}

function decodeBody(event: ApiGatewayLikeEvent): unknown {
  if (!event.body) return undefined;
  const text = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return parseBody(text);
}

/** Wraps an API Gateway handler. A block rejects, so the invocation fails. */
export function withShieldLambda(preset: Preset, override?: ShieldOverride) {
  return <TEvent extends ApiGatewayLikeEvent, TContext, TResult>(
      handler: (event: TEvent, context: TContext) => Promise<TResult>,
    ) =>
    async (event: TEvent, context: TContext): Promise<TResult> => {
      guard(
        {
          headers: event.headers,
          query: event.queryStringParameters ?? undefined,
          pathParameters: event.pathParameters ?? undefined,
          body: decodeBody(event),
        },
        preset,
        override,
      );
      return handler(event, context);
    };
}
