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
exports.withShieldSqs = withShieldSqs;
const guard_1 = require("./guard");
const parse_body_1 = require("./parse-body");
function attributesOf(record) {
    if (!record.messageAttributes)
        return undefined;
    return Object.fromEntries(Object.entries(record.messageAttributes).map(([key, attribute]) => [key, attribute.stringValue]));
}
function withShieldSqs(preset, override) {
    return (handler) => (record) => __awaiter(this, void 0, void 0, function* () {
        (0, guard_1.guard)({ headers: attributesOf(record), body: (0, parse_body_1.parseBody)(record.body) }, preset, override);
        return handler(record);
    });
}
//# sourceMappingURL=sqs.js.map