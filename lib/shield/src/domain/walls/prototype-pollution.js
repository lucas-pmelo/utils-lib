"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prototypePollutionWall = void 0;
const POLLUTING_KEYS = new Set(["__proto__", "constructor", "prototype"]);
exports.prototypePollutionWall = {
    kind: "structural",
    id: "prototype-pollution",
    severity: "critical",
    inspectNode: (key) => POLLUTING_KEYS.has(key),
};
//# sourceMappingURL=prototype-pollution.js.map