"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class ConflictError extends clb_error_1.default {
    constructor(message = 'ConflictError') {
        super({
            reason: message,
        }, 409);
    }
}
exports.default = ConflictError;
//# sourceMappingURL=conflict-error.js.map