"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guard = guard;
const shield_blocked_error_1 = __importDefault(require("../errors/shield-blocked-error"));
const resolve_config_1 = require("../domain/resolve-config");
const scan_1 = require("../domain/scan");
function guard(surfaces, preset, override) {
    const result = (0, scan_1.scan)(surfaces, (0, resolve_config_1.resolveConfig)(preset, override));
    if (result.verdict === "block")
        throw new shield_blocked_error_1.default(result);
}
//# sourceMappingURL=guard.js.map