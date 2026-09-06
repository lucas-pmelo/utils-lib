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
exports.withShieldBun = withShieldBun;
const guard_1 = require("./guard");
const parse_body_1 = require("./parse-body");
const MAGIC_HEAD_BYTES = 64;
function readMultipart(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = yield request.formData();
        const body = {};
        const files = [];
        for (const [key, value] of form.entries()) {
            if (typeof value === "string") {
                body[key] = value;
                continue;
            }
            files.push({
                filename: value.name,
                mimeType: value.type || undefined,
                size: value.size,
                head: new Uint8Array(yield value.slice(0, MAGIC_HEAD_BYTES).arrayBuffer()),
            });
        }
        return { body, files };
    });
}
function readSurfaces(request) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const url = new URL(request.url);
        const surfaces = {
            headers: Object.fromEntries(request.headers.entries()),
            query: Object.fromEntries(url.searchParams.entries()),
        };
        if (!request.body)
            return surfaces;
        if ((_a = request.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("multipart/form-data")) {
            const { body, files } = yield readMultipart(request);
            return Object.assign(Object.assign({}, surfaces), { body, files });
        }
        return Object.assign(Object.assign({}, surfaces), { body: (0, parse_body_1.parseBody)(yield request.text()) });
    });
}
function withShieldBun(preset, override) {
    return (handler) => (request) => __awaiter(this, void 0, void 0, function* () {
        const inspectable = request.clone();
        (0, guard_1.guard)(yield readSurfaces(inspectable), preset, override);
        return handler(request);
    });
}
//# sourceMappingURL=bun.js.map