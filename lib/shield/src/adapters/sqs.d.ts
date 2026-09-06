import type { Preset, ShieldOverride } from "../domain/resolve-config";
export interface SqsLikeRecord {
    messageId: string;
    body: string;
    messageAttributes?: Record<string, {
        stringValue?: string;
    }>;
}
export declare function withShieldSqs(preset: Preset, override?: ShieldOverride): <TRecord extends SqsLikeRecord, TResult>(handler: (record: TRecord) => Promise<TResult>) => (record: TRecord) => Promise<TResult>;
