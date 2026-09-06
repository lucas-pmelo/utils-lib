import type { Preset, ShieldOverride } from "../domain/resolve-config";
import type { FlatSurface } from "../domain/models";
export interface ApiGatewayLikeEvent {
    headers?: FlatSurface;
    queryStringParameters?: FlatSurface | null;
    pathParameters?: FlatSurface | null;
    body?: string | null;
    isBase64Encoded?: boolean;
}
export declare function withShieldLambda(preset: Preset, override?: ShieldOverride): <TEvent extends ApiGatewayLikeEvent, TContext, TResult>(handler: (event: TEvent, context: TContext) => Promise<TResult>) => (event: TEvent, context: TContext) => Promise<TResult>;
