import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { sqsPreset } from "../presets/index.js";
import { withShieldSqs } from "./sqs.js";

const handler = withShieldSqs(sqsPreset)(async (record) => record.messageId);

describe("withShieldSqs", () => {
  it("should call the wrapped handler when the record is clean", async () => {
    const record = { messageId: "m-1", body: JSON.stringify({ orderId: 7 }) };

    expect(await handler(record)).toBe("m-1");
  });

  it("should reject with ShieldBlockedError when the message body carries an attack", async () => {
    const record = { messageId: "m-2", body: JSON.stringify({ note: "'; DROP TABLE orders" }) };

    await expect(handler(record)).rejects.toThrow(ShieldBlockedError);
  });

  it("should reject with ShieldBlockedError when a message attribute carries an attack", async () => {
    const record = {
      messageId: "m-3",
      body: "{}",
      messageAttributes: { source: { stringValue: "../../etc/passwd" } },
    };

    await expect(handler(record)).rejects.toThrow(ShieldBlockedError);
  });

  it("should scan a non-JSON message body as raw text", async () => {
    await expect(handler({ messageId: "m-4", body: "'; DROP TABLE users--" })).rejects.toThrow(
      ShieldBlockedError,
    );
  });

  it("should pass a record with no attributes through", async () => {
    expect(await handler({ messageId: "m-5", body: "plain text" })).toBe("m-5");
  });
});
