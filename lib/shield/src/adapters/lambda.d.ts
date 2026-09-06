import type { Preset, ShieldOverride } from "../domain/resolve-config";
export interface ApiGatewayLikeEvent {
    headers?: Record<string, string | undefined>;
    queryStringParameters?: Record<string, string | undefined> | null;
    pathParameters?: Record<string, string | undefined> | null;
    body?: string | null;
    isBase64Encoded?: boolean;
}
export declare function withShieldLambda(preset: Preset, override?: ShieldOverride): <TEvent extends ApiGatewayLikeEvent, TContext, TResult>(handler: (event: TEvent, context: TContext) => Promise<TResult>) => (event: TEvent, context?: TContext) => Promise<TResult>;
