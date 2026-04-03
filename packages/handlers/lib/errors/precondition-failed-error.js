"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class PreconditionFailedError extends clb_error_1.default {
    constructor(message = 'PreconditionFailedError') {
        super({
            reason: message,
        }, 412);
    }
}
exports.default = PreconditionFailedError;
//# sourceMappingURL=precondition-failed-error.js.map