"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oversizedPayloadWall = void 0;
exports.oversizedPayloadWall = {
    kind: "structural",
    id: "oversized-payload",
    severity: "high",
    inspectNode: (_key, value, ctx) => typeof value === "string" && value.length > ctx.limits.maxStringLength,
};
//# sourceMappingURL=oversized-payload.js.map