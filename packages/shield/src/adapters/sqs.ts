import { guard } from "./guard";
import { parseBody } from "./parse-body";
import type { Preset, ShieldOverride } from "../domain/resolve-config";

/** The slice of an SQS record shield reads. */
export interface SqsLikeRecord {
  messageId: string;
  body: string;
  messageAttributes?: Record<string, { stringValue?: string }>;
}

/**
 * Message attributes are scanned on the `header` surface — they are metadata
 * travelling alongside the payload, which is the same shape of risk.
 */
function attributesOf(record: SqsLikeRecord): Record<string, string | undefined> | undefined {
  if (!record.messageAttributes) return undefined;
  return Object.fromEntries(
    Object.entries(record.messageAttributes).map(([key, attribute]) => [key, attribute.stringValue]),
  );
}

/** Wraps a per-record handler. A block rejects, so the message routes to the DLQ. */
export function withShieldSqs(preset: Preset, override?: ShieldOverride) {
  return <TRecord extends SqsLikeRecord, TResult>(
      handler: (record: TRecord) => Promise<TResult>,
    ) =>
    async (record: TRecord): Promise<TResult> => {
      guard(
        { headers: attributesOf(record), body: parseBody(record.body) },
        preset,
        override,
      );
      return handler(record);
    };
}
