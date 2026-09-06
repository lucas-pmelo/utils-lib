"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConfig = resolveConfig;
function resolveConfig(preset, override = {}) {
    var _a;
    return {
        walls: (_a = override.walls) !== null && _a !== void 0 ? _a : preset.walls,
        limits: Object.assign(Object.assign({}, preset.limits), override.limits),
        disable: override.disable,
        add: override.add,
    };
}
//# sourceMappingURL=resolve-config.js.map