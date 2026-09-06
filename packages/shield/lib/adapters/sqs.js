import { guard } from "./guard.js";
import { parseBody } from "./parse-body.js";
function attributesOf(record) {
    if (!record.messageAttributes)
        return undefined;
    return Object.fromEntries(Object.entries(record.messageAttributes).map(([key, attribute]) => [key, attribute.stringValue]));
}
export function withShieldSqs(preset, override) {
    return (handler) => async (record) => {
        guard({ headers: attributesOf(record), body: parseBody(record.body) }, preset, override);
        return handler(record);
    };
}
//# sourceMappingURL=sqs.js.map