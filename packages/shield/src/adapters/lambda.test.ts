import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { publicApiPreset } from "../presets/index.js";
import { withShieldLambda } from "./lambda.js";

const ok = async () => ({ statusCode: 200 });
const handler = withShieldLambda(publicApiPreset)(ok);

describe("withShieldLambda", () => {
  it("should call the wrapped handler when the event is clean", async () => {
    const result = await handler({
      headers: { accept: "application/json" },
      queryStringParameters: { page: "2" },
      pathParameters: { id: "42" },
      body: JSON.stringify({ name: "Ana" }),
    });

    expect(result).toEqual({ statusCode: 200 });
  });

  it("should reject with ShieldBlockedError when the JSON body carries an attack", async () => {
    const event = { body: JSON.stringify({ bio: "<script>alert(1)</script>" }) };

    await expect(handler(event)).rejects.toThrow(ShieldBlockedError);
  });

  it("should reject with ShieldBlockedError when a query parameter carries an attack", async () => {
    await expect(handler({ queryStringParameters: { q: "' OR 1=1 --" } })).rejects.toThrow(
      ShieldBlockedError,
    );
  });

  it("should reject with ShieldBlockedError when a path parameter carries an attack", async () => {
    await expect(handler({ pathParameters: { file: "../../etc/passwd" } })).rejects.toThrow(
      ShieldBlockedError,
    );
  });

  it("should decode a base64 body before scanning it", async () => {
    const event = {
      body: Buffer.from(JSON.stringify({ bio: "<script>x</script>" })).toString("base64"),
      isBase64Encoded: true,
    };

    await expect(handler(event)).rejects.toThrow(ShieldBlockedError);
  });

  it("should scan a non-JSON body as raw text", async () => {
    await expect(handler({ body: "'; DROP TABLE users--" })).rejects.toThrow(
      ShieldBlockedError,
    );
  });

  it("should pass an event with no body through", async () => {
    expect(await handler({})).toEqual({ statusCode: 200 });
  });

  it("should forward the lambda context to the wrapped handler", async () => {
    const echo = withShieldLambda(publicApiPreset)(async (_event, context) => context);

    expect(await echo({}, { awsRequestId: "abc" })).toEqual({ awsRequestId: "abc" });
  });
});
