"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withShieldElysia = withShieldElysia;
const guard_1 = require("./guard");
function withShieldElysia(preset, override) {
    return (context) => {
        (0, guard_1.guard)({
            headers: context.headers,
            query: context.query,
            pathParameters: context.params,
            body: context.body,
        }, preset, override);
    };
}
//# sourceMappingURL=elysia.js.map