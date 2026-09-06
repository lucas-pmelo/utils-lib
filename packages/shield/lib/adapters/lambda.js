import { guard } from "./guard";
import { parseBody } from "./parse-body";
function decodeBody(event) {
    if (!event.body)
        return undefined;
    const text = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
    return parseBody(text);
}
export function withShieldLambda(preset, override) {
    return (handler) => async (event, context) => {
        guard({
            headers: event.headers,
            query: event.queryStringParameters ?? undefined,
            pathParameters: event.pathParameters ?? undefined,
            body: decodeBody(event),
        }, preset, override);
        return handler(event, context);
    };
}
//# sourceMappingURL=lambda.js.map