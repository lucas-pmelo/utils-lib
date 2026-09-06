"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withShieldLambda = withShieldLambda;
const guard_1 = require("./guard");
const parse_body_1 = require("./parse-body");
function decodeBody(event) {
    if (!event.body)
        return undefined;
    const text = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
    return (0, parse_body_1.parseBody)(text);
}
function withShieldLambda(preset, override) {
    return (handler) => (event, context) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        (0, guard_1.guard)({
            headers: event.headers,
            query: (_a = event.queryStringParameters) !== null && _a !== void 0 ? _a : undefined,
            pathParameters: (_b = event.pathParameters) !== null && _b !== void 0 ? _b : undefined,
            body: decodeBody(event),
        }, preset, override);
        return handler(event, context);
    });
}
//# sourceMappingURL=lambda.js.map