"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class ShieldBlockedError extends clb_error_1.default {
    constructor(result) {
        super({
            reason: "Request blocked by shield",
            invalidParams: result.findings.map((finding) => ({
                value: `${finding.surface}:${finding.path}`,
                reason: finding.wallId,
            })),
        }, 403);
        this.result = result;
    }
}
exports.default = ShieldBlockedError;
//# sourceMappingURL=shield-blocked-error.js.map