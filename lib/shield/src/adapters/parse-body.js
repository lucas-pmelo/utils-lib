"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBody = parseBody;
function parseBody(text) {
    try {
        return JSON.parse(text);
    }
    catch (_a) {
        return text;
    }
}
//# sourceMappingURL=parse-body.js.map