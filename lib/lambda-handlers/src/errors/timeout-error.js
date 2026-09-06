"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class TimeoutError extends clb_error_1.default {
    constructor(message = 'TimeoutError') {
        super({
            reason: message,
        }, 408);
    }
}
exports.default = TimeoutError;
//# sourceMappingURL=timeout-error.js.map